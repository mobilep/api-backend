'use strict'

const joi = require('joi')
const ObjectId = require('mongoose').Types.ObjectId

module.exports.validateCreate = (data) => {
  const schema = joi.object().keys({
    name: joi.string()
      .trim()
      .min(1)
      .max(255)
      .required()
      .regex(utils.Validate.companyName),
    info: joi.string().max(4096).allow('')
  })

  const result = joi.validate(data, schema)

  if (result.error) {
    throw utils.ErrorHelper.invalidJoi(result.error)
  }

  return result.value
}

module.exports.validateEdit = (data) => {
  const schema = joi.object().keys({
    name: joi.string().trim().min(1).max(255).regex(utils.Validate.companyName),
    info: joi.string().max(4096).allow('')
  })

  const result = joi.validate(data, schema)

  if (result.error) {
    throw utils.ErrorHelper.invalidJoi(result.error)
  }

  return result.value
}

module.exports.validateInviteUsers = (data) => {
  const schema = joi.array().items(joi.object().keys({
    firstName: joi.string().trim().min(1).max(30).required().regex(utils.Validate.userName),
    lastName: joi.string().trim().min(1).max(30).required().regex(utils.Validate.userName),
    email: joi.string().trim().min(1).required().regex(utils.Validate.email),
    country: joi.string().trim().min(1).required(),
    lang: joi.string().trim().min(1).required(),
    postcode: joi.string().trim().min(1).max(30).required(),
    managerCriteria: joi.string().trim().allow('').regex(utils.Validate.managerCriteria),
    extraInformation: joi.array().items(joi.object().keys({
      title: joi.string().trim().min(1).max(30).valid(
        'Business Unit',
        'Region',
        'Country Region',
        'Global Region',
        'Custom 1',
        'Custom 2',
        'Custom 3'),
      description: joi.string().trim().min(0).max(30).allow('')
    })).min(7).max(7),
    password: joi.string().min(8).max(64).regex(utils.Validate.password),
    isCompanyAdmin: joi.boolean()
  })).allow(null)

  const result = joi.validate(data, schema)

  if (result.error) {
    console.log(result.error)
    throw utils.ErrorHelper.invalidJoi(result.error)
  }

  return result.value
}

module.exports.getImportedUserObject = (data) => {
  const user = {}
  user.email = data[0]
  user.firstName = data[1]
  user.lastName = data[2]
  user.lang = data[3]
  user.postcode = data[4]
  user.country = data[5]
  user.coach = data[6]
  user.team = data[7]
  user.extraInformation = []
  // @TODO: Seems that logic below should be refactored
  if (data.length > 8) {
    for (let title = 8, description = 9; title <
    data.length; title += 2, description += 2) {
      if (data[title] && data[description]) {
        user.extraInformation.push({
          title: data[title],
          description: data[description]
        })
      }
    }
  }
  if (user.extraInformation.length > 7) {
    throw utils.ErrorHelper.badRequest('ERROR_IMPORT_USER_EXTRAINFORMATION')
  }
  const ei = [
    {
      title: 'Business Unit',
      description: ''
    },
    {
      title: 'Region',
      description: ''
    },
    {
      title: 'Country Region',
      description: ''
    },
    {
      title: 'Global Region',
      description: ''
    },
    {
      title: 'Custom 1',
      description: ''
    },
    {
      title: 'Custom 2',
      description: ''
    },
    {
      title: 'Custom 3',
      description: ''
    }
  ]
  if (user.extraInformation.length > 0) {
    user.extraInformation.forEach((val) => {
      ei.forEach((eiVal) => {
        if (eiVal.title === val.title) {
          eiVal.description = val.description
        }
      })
    })
  }
  user.extraInformation = ei
  return user
}

module.exports.validateImportUserMainFields = (data) => {
  const schema = joi.object().keys({
    firstName: joi.string().trim().min(1).max(30).required().regex(utils.Validate.userName),
    lastName: joi.string().trim().min(1).max(30).required().regex(utils.Validate.userName),
    email: joi.string().trim().min(1).required().regex(utils.Validate.email),
    country: joi.string().trim().min(1).required(),
    lang: joi.string().trim().min(1).required(),
    postcode: joi.string().trim().trim().min(1).max(30).required(),
    extraInformation: joi.array().items(joi.object().keys({
      title: joi.string().trim().min(1).max(30).valid(
        'Business Unit',
        'Region',
        'Country Region',
        'Global Region',
        'Custom 1',
        'Custom 2',
        'Custom 3'),
      description: joi.string().trim().min(0).max(30).allow('')
    })).min(7).max(7)
  })

  const result = joi.validate(data, schema, {allowUnknown: true})

  if (result.error) {
    throw utils.ErrorHelper.invalidJoi(result.error)
  }

  return result.value
}

module.exports.validateImportUserTeamFields = (data) => {
  if (!data.coach && !data.team) {
    return data
  }
  const schema = joi.object().keys({
    coach: joi.string().trim().regex(utils.Validate.email),
    team: joi.string().min(1).max(128)
  })

  const result = joi.validate(data, schema, {allowUnknown: true})

  if (result.error || (!data.coach && data.team) || (data.coach && !data.team)) {
    throw new Error('NOT_VALID')
  }

  return result.value
}

module.exports.validateSendInvite = (data) => {
  const schema = joi.array().items(joi.string()).allow(null)

  const result = joi.validate(data, schema)

  if (result.value.length) {
    result.value.forEach((id) => {
      if (!ObjectId.isValid(id)) {
        throw utils.ErrorHelper.badRequest('ERROR_INVALID_USER')
      }
    })
  }

  if (result.error) {
    console.log(result.error)
    throw utils.ErrorHelper.invalidJoi(result.error)
  }

  return result.value
}

module.exports.validateSendTestEmail = (data) => {
  const schema = joi.object().keys({
    email: joi.string().lowercase().min(1).required().regex(utils.Validate.email),
    lang: joi.string().lowercase().valid('en', 'fr').required()
  })

  const result = joi.validate(data, schema)

  if (result.error) {
    throw utils.ErrorHelper.badRequest('ERROR_EMAIL_VALIDATION_FAIL')
  }

  return result.value
}
