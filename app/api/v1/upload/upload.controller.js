'use strict'
const helperUpload = require('./upload.helper')
const Busboy = require('busboy')
const uploadEventEmitter = require('./upload.event').uploadEventEmitter
const bl = require('bl')

module.exports.upload = (req, res, next) => {
  let fileID = ''
  let buffer = ''
  const busboy = new Busboy({
    headers: req.headers,
    limits: {
      files: 1
    }
  })

  busboy.on('field', (key, value) => {
    req.body[key] = value
  })

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    file.pipe(bl(function (err, d) {
      if (err || !(d.length || filename)) { return }
      buffer = d
    }))
    file.on('data', (data) => {})
    file.on('end', () => {
      try {
        fileID = helperUpload.validateFileId(helperUpload.generateFileId(req.body.fileID))
        const bucked = helperUpload.getBucked(filename)
        uploadEventEmitter.emit('send', {
          fileID,
          bucked,
          file: buffer,
          filename,
          mimetype
        })
      } catch (error) {
        next(error)
        busboy.removeAllListeners()
      }
    })
  })

  busboy.on('finish', () => {
    res.json({fileID})
  })
  req.pipe(busboy)
}

module.exports.multyupload = (req, res) => {
  const result = []
  const busboy = new Busboy({
    headers: req.headers,
    limits: {
      files: 5
    }
  })

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    let buffer = null
    file.pipe(bl(function (err, d) {
      if (err || !(d.length || filename)) { return }
      buffer = d
    }))
    file.on('end', () => {
      const fileID = helperUpload.generateFileId()
      const bucked = helperUpload.getBucked(filename)
      uploadEventEmitter.emit('send', {
        fileID,
        bucked,
        file: buffer,
        filename,
        mimetype
      })
      result.push({
        fileID,
        file: filename,
        type: mimetype
      })
    })
  })

  busboy.on('finish', () => {
    res.json({files: result})
  })

  req.pipe(busboy)
}

module.exports.presigned = (req, res) => {
  const fileID = helperUpload.validateFileId(helperUpload.generateFileId(req.body.fileID))
  const bucked = helperUpload.getBucked(req.body.filename)
  const ext = helperUpload.isPhoto(req.body.filename) || helperUpload.isVideo(req.body.filename)
  const name = fileID + ext[0]
  res.json({fileID, name, url: helperUpload.presigned(bucked, name, req.body.ContentType)})
}
