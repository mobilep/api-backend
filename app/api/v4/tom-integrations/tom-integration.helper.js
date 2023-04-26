'use strict'

const joi = require('joi')

module.exports.validateCreateIntegration = (data) => {
  const schema = joi.object().keys({
    name: joi.string().trim().min(1).max(255).required(),
    apiKey: joi.string().required(),
    apiSecret: joi.string().required(),
    link: joi.string().required()
  })

  const result = joi.validate(data, schema)

  if (result.error) {
    throw utils.ErrorHelper.invalidJoi(result.error)
  }

  return result.value
}
