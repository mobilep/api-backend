'use strict'

const joi = require('joi')
const ErrorHelper = require('../errorHelper')
const ObjectId = require('mongoose').Types.ObjectId

module.exports.validateCreate = (data) => {
  const schema = joi.object().keys({
    type: joi.string().valid('inbox', 'practice'),
    _moderator: joi.string().trim().required(),
    _scenario: joi.string().trim(),
    title: joi.string().min(1).max(128)
  })

  const result = joi.validate(data, schema)

  if (!ObjectId.isValid(result.value._moderator)) {
    throw ErrorHelper.badRequest('ERROR_INVALID_MODERATOR')
  }

  if (result.error) {
    throw ErrorHelper.invalidJoi(result.error)
  }

  return result.value
}

module.exports.validateGroupMessage = (data) => {
  const schema = joi.object().keys({
    content: joi.any(),
    type: joi.string().valid('text', 'video', 'file', 'image', 'audio')
  })

  const result = joi.validate(data, schema)

  if (result.error) {
    throw ErrorHelper.invalidJoi(result.error)
  }

  return result.value
}

module.exports.validateEdit = (data) => {
  const schema = joi.object().keys({
    status: joi.string().valid('read', 'unread'),
    lastReadMessage: joi.string().allow(null),
    title: joi.string().min(1).max(128)
  })

  const result = joi.validate(data, schema)

  if (result.error) {
    throw ErrorHelper.invalidJoi(result.error)
  }

  return result.value
}

module.exports.validateId = (userId) => {
  if (!ObjectId.isValid(userId)) {
    throw ErrorHelper.badRequest('ERROR_INVALID_OBJECT_ID')
  }
}
