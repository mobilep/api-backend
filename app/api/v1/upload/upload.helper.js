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

module.exports.getBucked = (filename) => {
  if (module.exports.isPhoto(filename)) {
    return _config.aws.photoBucket
  } else if (module.exports.isVideo(filename)) {
    return _config.aws.videoBucket
  } else {
    throw errorHelper.badRequest('Unexpected file format')
  }
}

module.exports.uploadToS3 = (bucket, fileID, file, metadata) => {
  const s3bucket = new AWS.S3({
    accessKeyId: _config.aws.accessKeyId,
    secretAccessKey: _config.aws.secretAccessKey,
    Bucket: bucket
  })
  s3bucket.upload({
    Bucket: bucket,
    Key: 'uploads/' + fileID,
    ContentType: metadata,
    Body: file
  }, (err, data) => {
    console.log('uploadToS3', err, data)
  })
}

module.exports.presigned = (bucket, filename, ContentType) => {
  const s3bucket = new AWS.S3({
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
