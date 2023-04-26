'use strict'

const joi = require('joi')

module.exports.validateManageUsers = (data) => {
  const schema = joi.object().keys({
    users: joi.array().items(joi.string().trim()).required()
  })

  const result = joi.validate(data, schema)

  if (result.error) {
    throw utils.ErrorHelper.invalidJoi(result.error)
  }

  return result.value
}

module.exports.validateCreate = (data) => {
  const schema = joi.object().keys({
    recipients: joi.array().items(joi.string().trim()),
    title: joi.string().min(1).max(128).required()
  })

  const result = joi.validate(data, schema)

  if (result.error) {
    throw utils.ErrorHelper.invalidJoi(result.error)
  }

  return result.value
}

module.exports.validateEdit = (data) => {
  const schema = joi.object().keys({
    status: joi.string().valid('read', 'unread'),
    lastReadMessage: joi.string().allow(null),
    title: joi.string().min(1).max(128),
    users: joi.array().items(joi.string().trim())
  })

  const result = joi.validate(data, schema)

  if (result.error) {
    throw utils.ErrorHelper.invalidJoi(result.error)
  }

  return result.value
}

module.exports.validateMessage = (data) => {
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
