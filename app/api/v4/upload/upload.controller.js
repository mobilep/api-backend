'use strict'
const helperUpload = require('./upload.helper')
const _config = require('./../../../config/config.js')

module.exports.presigned = (req, res) => {
  const fileID = helperUpload.validateFileId(helperUpload.generateFileId(req.body.fileID))
  const fileType = req.body.ContentType.split('/')[0]
  const bucked = helperUpload.getBucked(req.body.filename, fileType, req.body.category)
  const ext = helperUpload.isPhoto(req.body.filename) || helperUpload.isVideo(req.body.filename) ||
      helperUpload.isFile(req.body.filename) || helperUpload.isAudio(req.body.filename)
  const name = fileID + ext[0]
  const region = _config.aws.region
  res.json({fileID, name, url: helperUpload.presigned(bucked, name, req.body.ContentType, region)})
}
