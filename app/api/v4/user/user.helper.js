'use strict'

const joi = require('joi')
const ObjectId = require('mongoose').Types.ObjectId
const daoTeam = require('../team/team.dao')

module.exports.validateSignin = (data) => {
  const schema = joi.object().keys({
    email: joi.string()
      .lowercase()
      .min(1)
      .required()
      .regex(utils.Validate.email),
    password: joi.string().min(1),
    webForm: joi.boolean()
  })

  const result = joi.validate(data, schema)

  if (result.error) {
    throw utils.ErrorHelper.invalidJoi(result.error)
  }

  return result.value
}

module.exports.validateForgotPass = (data) => {
  const schema = joi.object().keys({
    email: joi.string()
      .lowercase()
      .min(1)
      .required()
      .regex(utils.Validate.email)
  })

  const result = joi.validate(data, schema)

  if (result.error) {
    throw utils.ErrorHelper.invalidJoi(result.error)
  }

  return result.value
}

module.exports.validateClientForgotPass = (data) => {
  const schema = joi.object().keys({
    email: joi.string()
      .lowercase()
      .min(1)
      .required()
      .regex(utils.Validate.email),
    resetClient: joi.string().optional()
  })

  const result = joi.validate(data, schema)

  if (result.error) {
    throw utils.ErrorHelper.invalidJoi(result.error)
  }

  return result.value
}

module.exports.validateNewPass = (data) => {
  const schema = joi.object().keys({
    password: joi.string().min(8).max(64).regex(utils.Validate.password).required(),
    terms: joi.boolean().optional()
  })

  const result = joi.validate(data, schema)

  if (result.error) {
    throw utils.ErrorHelper.invalidJoi(result.error)
  }

  return result.value
}

module.exports.validateEditMe = (data) => {
  const schema = joi.object().keys({
    lang: joi.string().trim().min(1)
  })
  const result = joi.validate(data, schema)
  if (result.error) {
    throw utils.ErrorHelper.invalidJoi(result.error)
  }

  if (result.value.lang !== 'fr') {
    result.value.lang = 'en'
  }

  return result.value
}

module.exports.validateEditTerms = (data) => {
  const schema = joi.object().keys({
    terms: joi.boolean().required()
  })
  const result = joi.validate(data, schema)
  if (result.error) {
    throw utils.ErrorHelper.invalidJoi(result.error)
  }

  return result.value
}

module.exports.validateEdit = (data) => {
  const schema = joi.object().keys({
    email: joi.string().trim().lowercase().min(1).regex(utils.Validate.email),
    isMailNotification: joi.boolean(),
    firstName: joi.string().trim().min(1).max(30).regex(utils.Validate.userName),
    lastName: joi.string().trim().min(1).max(30).regex(utils.Validate.userName),
    avatarId: joi.string().min(1).max(100),
    avatarColor: joi.string().min(1).max(100),
    country: joi.string().trim().min(1),
    postcode: joi.string().trim().min(1).max(30).allow(''),
    lang: joi.string().trim().min(1),
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
    isCompanyAdmin: joi.boolean(),
    password: joi.string().min(8).max(64).regex(utils.Validate.password),
    _coach: joi.string().trim().lowercase().min(1).regex(utils.Validate.email).allow('')
  })
  const result = joi.validate(data, schema)
  if (result.error) {
    throw utils.ErrorHelper.invalidJoi(result.error)
  }

  return result.value
}
module.exports.validateChangePass = (data) => {
  const schema = joi.object().keys({
    oldPassword: joi.string()
      .min(8)
      .max(30)
      .regex(utils.Validate.password)
      .required(),
    newPassword: joi.string()
      .min(8)
      .max(30)
      .regex(utils.Validate.password)
      .required()
  })

  const result = joi.validate(data, schema)

  if (result.error) {
    throw utils.ErrorHelper.invalidJoi(result.error)
  }

  return result.value
}

module.exports.validateCreateSysAdmin = (data) => {
  const schema = joi.object().keys({
    email: joi.string().trim()
      .lowercase()
      .min(1)
      .required()
      .regex(utils.Validate.email),
    firstName: joi.string().trim().min(1).max(30).required().regex(utils.Validate.userName),
    lastName: joi.string().trim().min(1).max(30).required().regex(utils.Validate.userName),
    password: joi.string().min(8).max(64).regex(utils.Validate.password).required(),
    country: joi.string().trim().required().min(1),
    postcode: joi.string().trim().trim().min(1).max(30).allow('').required(),
    lang: joi.string().trim().min(1).required()
  })

  const result = joi.validate(data, schema)

  if (result.error) {
    throw utils.ErrorHelper.invalidJoi(result.error)
  }

  return result.value
}

module.exports.validateSearchQuery = (query) => {
  const schema = joi.string().trim().regex(utils.Validate.searchFilter)
  const result = joi.validate(query, schema)
  if (result.error) {
    throw utils.ErrorHelper.invalidJoi(result.error)
  }
  return result.value.replace(/\./, '\\.')
}

module.exports.validateSortQuery = (query) => {
  const schema = joi.string().trim().regex(utils.Validate.sort)
  const result = joi.validate(query, schema)
  if (result.error) {
    throw utils.ErrorHelper.invalidJoi(result.error)
  }
  return result.value
}

module.exports.validateBulkDelete = (data) => {
  const schema = joi.array().items(joi.object().keys({
    _id: joi.string(),
    isActive: joi.boolean()
  }))

  const result = joi.validate(data, schema)

  if (result.value.length) {
    result.value.forEach((user) => {
      if (!ObjectId.isValid(user._id)) {
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

module.exports.validateDevice = (data) => {
  const schema = joi.object().keys({
    token: joi.string().trim().min(1).required(),
    isAndroid: joi.boolean()
  })
  const result = joi.validate(data, schema)
  if (result.error) {
    throw utils.ErrorHelper.invalidJoi(result.error)
  }

  return result.value
}

module.exports.parseManagerCriteria = (string) => {
  const ownFieldsList = ['country', 'postcode']
  const result = {
    ownFields: [],
    extraFields: []
  }
  string.split(',').filter(sec => sec).forEach((sec) => {
    sec = sec.trim()
    const splitted = sec.split(':')
    const title = splitted[0].trim()
    const values = splitted[1].split('|').filter(val => val.trim())
    if (ownFieldsList.indexOf(title) >= 0) {
      result.ownFields.push({title, values})
    } else {
      result.extraFields.push({title, values})
    }
  })
  return result
}

module.exports.filterUsersResponse = async (users, userIds) => {
  userIds = userIds.map(id => ObjectId(id._id))
  const usersDefaultTeams = await daoTeam.getTeamsWithActiveUsers({isDefault: true, _owner: {$in: userIds}})

  return users.map(user => {
    user = user.toJSON()

    const hasTeam = usersDefaultTeams.find(team => team._owner.toString() === user._id.toString())
    user.isCoach = !!hasTeam

    return user
  })
}
