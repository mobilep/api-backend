'use strict'
const AWS = require('aws-sdk')
const _config = require('./../../../config/config.js')
const uuid = require('node-uuid')
const joi = require('joi')
const errorHelper = require('./../../../utils/errorHelper')

module.exports.generateFileId = (fileID) => {
  return fileID || uuid.v4()
}

module.exports.validateFileId = (fileID) => {
  const schema = joi.object().keys({
    fileID: joi.string().guid()
  })
  const result = joi.validate({fileID}, schema)

  if (result.error) {
    throw utils.ErrorHelper.invalidJoi(result.error)
  }

  return result.value.fileID
}

module.exports.getExt = (filename) => {
  return filename.split('.').pop()
}

module.exports.isVideo = (filename) => {
  return filename.match(/.(mp4|avi|wav|mov)$/i)
}

module.exports.isPhoto = (filename) => {
  return filename.match(/.(jpg|jpeg|png|gif)$/i)
}

module.exports.isFile = (filename) => {
  return filename.match(/.(pdf)$/i)
}

module.exports.isAudio = (filename) => {
  return filename.match(/.(mp3|wav|webm|m4a)$/i)
}

module.exports.getBucked = (filename, filetype, category) => {
  if (module.exports.isPhoto(filename) && filetype === 'image' && category === 'avatar') {
    return _config.aws.photoBucket
  } else if (module.exports.isPhoto(filename) && filetype === 'image' && category === 'photo') {
    return _config.aws.inboxPhotoBucket
  } else if (module.exports.isVideo(filename) && filetype === 'video') {
    return _config.aws.videoBucket
  } else if (module.exports.isFile(filename) && filetype === 'application') {
    return _config.aws.fileBucket
  } else if (module.exports.isAudio(filename) && filetype === 'audio') {
    return _config.aws.audioBucket
  } else {
    throw errorHelper.badRequest('Unexpected file format')
  }
}

module.exports.presigned = (bucket, filename, ContentType, region) => {
  const s3bucket = new AWS.S3({
    region,
    accessKeyId: _config.aws.accessKeyId,
    secretAccessKey: _config.aws.secretAccessKey,
    s3ForcePathStyle: true
  })

  return s3bucket.getSignedUrl('putObject', {
    Bucket: bucket,
    Key: 'uploads/' + filename,
    // Expires: 60
    ContentType
  })
}
