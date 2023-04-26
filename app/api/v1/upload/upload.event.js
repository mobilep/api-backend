'use strict'
const EventEmitter = require('events')
const helperUpload = require('./upload.helper')

class UploadEventEmitter extends EventEmitter {}

const uploadEventEmitter = new UploadEventEmitter()

uploadEventEmitter.on('send', (data) => {
  const filename = data.fileID + '.' + helperUpload.getExt(data.filename)
  helperUpload.uploadToS3(data.bucked, filename, data.file, data.mimetype)
})

module.exports.uploadEventEmitter = uploadEventEmitter
