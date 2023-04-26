'use strict'

const joi = require('joi')

module.exports.validateUpdate = (data) => {
  const schema = joi.object().keys({
    userMark: joi.array().items(joi.object().keys({
      _criteria: joi.string().allow(null),
      mark: joi.number().min(1).max(5)
    })),
    coachMark: joi.array().items(joi.object().keys({
      _criteria: joi.string(),
      mark: joi.number().min(1).max(5)
    }))
  })

  const result = joi.validate(data, schema)

  if (result.error) {
    throw utils.ErrorHelper.invalidJoi(result.error)
  }

  return result.value
}
