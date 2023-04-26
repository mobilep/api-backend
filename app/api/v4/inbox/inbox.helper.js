'use strict'

const joi = require('joi')
const ObjectId = require('mongoose').Types.ObjectId

module.exports.validateCreate = (data) => {
  const schema = joi.object().keys({
    _recipient: joi.string().trim().required()
  })

  const result = joi.validate(data, schema)

  if (result.error) {
    throw utils.ErrorHelper.invalidJoi(result.error)
  }

  if (!ObjectId.isValid(result.value._recipient)) {
    throw utils.ErrorHelper.badRequest('ERROR_INVALID_RECIPIENT')
  }

  return result.value
}

module.exports.validateEdit = (data) => {
  const schema = joi.object().keys({
    status: joi.string().valid('read', 'unread'),
    lastReadMessage: joi.string().allow(null)
  })

  const result = joi.validate(data, schema)

  if (result.error) {
    throw utils.ErrorHelper.invalidJoi(result.error)
  }

  return result.value
}

module.exports.validateInboxMessage = (data) => {
  const schema = joi.object().keys({
    content: joi.any(),
    type: joi.string().valid('text', 'video', 'file', 'image', 'audio')
  })

  const result = joi.validate(data, schema)

  if (result.error) {
    throw utils.ErrorHelper.invalidJoi(result.error)
  }

  return result.value
}

module.exports.validateBulkDelete = (data) => {
  const schema = joi.object().keys({
    _id: joi.string().trim(),
    isActive: joi.boolean()
  })

  const result = joi.validate(data, joi.array().items(schema))

  if (result.error) {
    throw utils.ErrorHelper.invalidJoi(result.error)
  }

  return result.value
}
