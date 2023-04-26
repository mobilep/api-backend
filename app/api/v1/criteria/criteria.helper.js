'use strict'

const joi = require('joi')

module.exports.validateCreate = (data) => {
  const schema = joi.object().keys({
    name: joi.string().min(1).max(128).required(),
    info: joi.string()
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
    info: joi.string()
  })

  const result = joi.validate(data, schema)

  if (result.error) {
    throw utils.ErrorHelper.invalidJoi(result.error)
  }

  return result.value
}
