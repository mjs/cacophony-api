const jsonwebtoken      = require('jsonwebtoken');
const mime             = require('mime');

const { ClientError }   = require('../customErrors');
const config            = require('../../config');
const models            = require('../../models');
const responseUtil      = require('./responseUtil');
const util              = require('./util');


function makeUploadHandler(mungeData) {
  return util.multipartUpload((request, data, key) => {
    if (mungeData) {
      data = mungeData(data);
    }

    const recording = models.Recording.build(data, {
      fields: models.Recording.apiSettableFields,
    });
    recording.set('rawFileKey', key);
    recording.set('rawMimeType', guessRawMimeType(data.type, data.filename));
    recording.set('DeviceId', request.device.id);
    recording.set('GroupId', request.device.GroupId);
    recording.set('processingState', models.Recording.processingStates[data.type][0]);
    if (typeof request.device.public === 'boolean') {
      recording.set('public', request.device.public);
    }
    return recording;
  });
}

// Returns a promise for the recordings query specified in the
// request.
function query(request, type) {
  if (request.query.tagMode == null) {
    request.query.tagMode = 'any';
  }
  if (!request.query.where) {
    request.query.where = {};
  }

  // remove legacy tag mode selector (if included)
  delete request.query.where._tagged;

  if (type) {
    request.query.where.type = type;
  }

  return models.Recording.query(
    request.user,
    request.query.where,
    request.query.tagMode,
    request.query.tags,
    request.query.offset,
    request.query.limit,
    request.query.order);
}

async function get(request, type) {
  const recording = await models.Recording.getOne(request.user, request.params.id, type);
  if (!recording) {
    throw new ClientError("No file found with given datapoint");
  }

  const downloadFileData = {
    _type: 'fileDownload',
    key: recording.fileKey,
    filename: recording.getFileName(),
    mimeType: recording.fileMimeType,
  };

  const downloadRawData = {
    _type: 'fileDownload',
    key: recording.rawFileKey,
    filename: recording.getRawFileName(),
    mimeType: recording.rawMimeType,
  };
  delete recording.rawFileKey;

  return {
    recording: recording,
    cookedJWT: jsonwebtoken.sign(
      downloadFileData,
      config.server.passportSecret,
      { expiresIn: 60 * 10 }
    ),
    rawJWT: jsonwebtoken.sign(
      downloadRawData,
      config.server.passportSecret,
      { expiresIn: 60 * 10 }
    ),
  };
}

async function delete_(request, response) {
  var deleted = await models.Recording.deleteOne(request.user, request.params.id);
  if (deleted) {
    responseUtil.send(response, {
      statusCode: 200,
      success: true,
      messages: ["Deleted recording."],
    });
  } else {
    responseUtil.send(response, {
      statusCode: 400,
      success: false,
      messages: ["Failed to delete recording."],
    });
  }
}

function guessRawMimeType(type, filename) {
  var mimeType = mime.getType(filename);
  if (mimeType) {
    return mimeType;
  }
  switch (type) {
  case "thermalRaw":
    return "application/x-cptv";
  case "audio":
    return "audio/mpeg";
  default:
    return "application/octet-stream";
  }
}


exports.makeUploadHandler = makeUploadHandler;
exports.query = query;
exports.get = get;
exports.delete_ = delete_;
