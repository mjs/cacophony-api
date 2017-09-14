var models = require('../../models');
var util = require('./util');
var passport = require('passport');
var log = require('../../logging');
var tagsUtil = require('./tagsUtil');

module.exports = function(app, baseUrl) {
  var apiUrl = baseUrl + '/audiorecordings';

  /**
  * @api {post} /api/v1/audiorecordings/ Add a new audio recording
  * @apiName PostAudioRecording
  * @apiGroup AudioRecordings
  */
  app.post(
    apiUrl,
    passport.authenticate(['jwt'], { session: false }),
    function(req, res) {
      log.info(req.method + " Request: " + req.url);
      return util.addRecordingFromPost(models.AudioRecording, req, res);
    });


  /**
  * @api {put} /api/v1/audiorecordings/:id Update an existing audio recording
  * @apiName PutAudioRecording
  * @apiGroup AudioRecordings
  *
  * @apiHeader {String} data Data to update in JSON
  */
  app.put(
    apiUrl + "/:id",
    passport.authenticate(['jwt'], { session: false }),
    function(req, res) {
      log.info(req.method + " Request: " + req.url);
      return util.updateDataFromPut(models.AudioRecording, req, res);
    });

  /**
  * @api {delete} /api/v1/audiorecordings/:id Delete an existing audio recording
  * @apiName DeleteAudioRecording
  * @apiGroup AudioRecordings
  */
  app.delete(
    apiUrl + '/:id',
    passport.authenticate(['jwt'], { session: false }),
    function(req, res) {
      log.info(req.method + " Request: " + req.url);
      return util.deleteDataPoint(models.AudioRecording, req, res);
    });

  /**
  * @api {get} /api/v1/audiorecordings/ Query available audio recordings.
  * @apiName GetAudioRecordings
  * @apiGroup AudioRecordings
  *
  * @apiHeader {String} where Sequelize conditions for query,
  * @apiHeader {Number} offset Query result offset (for paging)
  * @apiHeader {Number} limit Query result limit (for paging)
  */
  app.get(
    apiUrl,
    passport.authenticate(['jwt', 'anonymous'], { session: false }),
    function(req, res) {
      log.info(req.method + " Request: " + req.url);
      return util.getRecordingsFromModel(models.AudioRecording, req, res);
    });

  app.get(
    apiUrl + "/:id",
    passport.authenticate(['jwt', 'anonymous'], { session: false }),
    function(req, res) {
      log.info(req.method + " Request: " + req.url);
      return util.getRecordingFile(models.AudioRecording, req, res);
    });

  app.post(
    apiUrl + "/:id/tags",
    passport.authenticate(['jwt', 'anonymous'], { session: false }),
    function(req, res) {
      log.info(req.method + " Request: " + req.url);
      return tagsUtil.add(models.AudioRecording, req, res);
    });

  app.delete(
    apiUrl + '/:id/tags',
    passport.authenticate(['jwt', 'anonymous'], { session: false }),
    function(req, res) {
      log.info(req.method + " Request: " + req.url);
      return tagsUtil.remove(models.AudioRecording, req, res);
    });

  app.get(
    apiUrl + '/:id/tags',
    passport.authenticate(['jwt', 'anonymous'], { session: false }),
    function(req, res) {
      log.info(req.method + " Request: " + req.url);
      return tagsUtil.get(models.AudioRecording, req, res);
    });
};
