'use strict'

const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const _config = require('../config/config.js')
const errorHelper = require('./errorHelper')

module.exports.createAuthToken = (user, expiresIn) => {
  const tokenSecret = _config.token
  const tokenPayload = {
    userId: user._id,
    avatarId: user.avatarId
  }

  expiresIn = expiresIn || 24 * 60 * 60 * 30 * 6 // PROD 6m
  return jwt.sign(tokenPayload, tokenSecret, {expiresIn: expiresIn})
}

module.exports.extractAuthToken = (authToken, token) => {
  const tokenSecret = token || _config.token
  return new Promise((resolve, reject) => {
    jwt.verify(authToken, tokenSecret, (err, decoded) => {
      if (err) {
        return reject(errorHelper.unauthorized(err.message))
      }
      return resolve(decoded)
    })
  })
}

module.exports.createResetToken = (user, expiresIn) => {
  let password = user.password
  if (!password) {
    password = this.encryptPassword(user._id.toString())
  }
  const tokenSecret = _config.token
  const tokenPayload = {
    userId: user._id,
    hash: this.encryptPassword(password)
  }

  expiresIn = expiresIn || 24 * 60 * 60 * 30 * 6
  return jwt.sign(tokenPayload, tokenSecret, {expiresIn: expiresIn})
}

module.exports.extractResetToken = (resetToken, token) => {
  const tokenSecret = token || _config.token
  return new Promise((resolve, reject) => {
    jwt.verify(resetToken, tokenSecret, (err, decoded) => {
      if (err) {
        return reject(errorHelper.unauthorized(err.message))
      }
      return resolve(decoded)
    })
  })
}

module.exports.encryptPassword = (password) => {
  try {
    return crypto.createHash('sha1').update(password).digest('hex')
  } catch (err) {
    throw errorHelper.serverError()
  }
}

module.exports.createDeviceToken = (user, token) => {
  const tokenSecret = _config.token
  const tokenPayload = {
    userId: user._id,
    token: token
  }
  return jwt.sign(tokenPayload, tokenSecret)
}

module.exports.extractDeiceToken = (deviceToken, token) => {
  const tokenSecret = token || _config.token
  return new Promise((resolve, reject) => {
    jwt.verify(deviceToken, tokenSecret, (err, decoded) => {
      if (err) {
        return reject(errorHelper.unauthorized(err.message))
      }
      return resolve(decoded)
    })
  })
}

module.exports.createEmailToken = (userEmail, nextUrl, expiresIn) => {
  const tokenSecret = _config.token
  const tokenPayload = {
    userEmail,
    nextUrl
  }

  expiresIn = expiresIn || 24 * 60 * 60 * 30 * 6 // PROD 6m
  return jwt.sign(tokenPayload, tokenSecret, {expiresIn: expiresIn})
}

module.exports.extractEmailToken = (emailToken, token) => {
  const tokenSecret = token || _config.token
  return new Promise((resolve, reject) => {
    jwt.verify(emailToken, tokenSecret, (err, decoded) => {
      if (err) {
        return reject(errorHelper.unauthorized(err.message))
      }
      return resolve(decoded)
    })
  })
}
