'use strict'

const joi = require('joi')

module.exports.validateCreate = (data) => {
  if (!data.name) {
    throw utils.ErrorHelper.badRequest('ERROR_GROUP_NAME_IS_REQUIRED')
  }

  const schema = joi.object().keys({
    name: joi.string().min(1).max(128).required(),
    _users: joi.array().items(joi.string())
  })

  const result = joi.validate(data, schema)

  if (result.error) {
    throw utils.ErrorHelper.invalidJoi(result.error)
  }

  return result.value
}

module.exports.validateEdit = (data) => {
  const schema = joi.object().keys({
    name: joi.string().min(1).max(128),
    _users: joi.array().items(joi.string()).min(1)
  })

  const result = joi.validate(data, schema)

  if (result.error) {
    throw utils.ErrorHelper.invalidJoi(result.error)
  }

  return result.value
}
