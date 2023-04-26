'use strict'

const joi = require('joi')

module.exports.validateInviteUsers = (data) => {
  const schema = joi.array().items(joi.object().keys({
    email: joi.string().trim().min(1).required().regex(utils.Validate.email),
    password: joi.string().min(8).max(64).required().regex(utils.Validate.password),
    isCompanyAdmin: joi.boolean().required(),
    isSysAdmin: joi.boolean().required(),
    firstName: joi.string().trim().min(1).max(30).regex(utils.Validate.userName),
    lastName: joi.string().trim().min(1).max(30).regex(utils.Validate.userName)
  })).allow(null)

  const result = joi.validate(data, schema)

  if (result.error) {
    console.log(result.error)
    throw utils.ErrorHelper.invalidJoi(result.error)
  }

  return result.value
}
