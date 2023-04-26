'use strict'

const joi = require('joi')
const moment = require('moment')
const ObjectId = require('mongoose').Types.ObjectId

const validateCurrent = (data, defaultDueDate) => {
  const schemaCurrent = joi.object().keys({
    name: joi.string().trim().min(1).max(128).required(),
    info: joi.string().trim().min(1).max(1024).required(),
    dueDate: joi.date().timestamp('javascript').allow(null).allow('').default(defaultDueDate),
    videoId: joi.string().required(),
    videoOrientation: joi.string().allow(null).allow(''),
    duration: joi.number(),
    size: joi.number(),
    steps: joi.array().items(joi.string().min(1).max(128).options({ language: {string: { max: '!!_ERROR_JOI_MAX_STEP_LENGTH' }} })).min(1).max(50),
    _criterias: joi.array().items(joi.string().min(1).max(128)).min(1),
    canEditVideo: joi.boolean(),
    examples: joi.array().items(joi.object().keys({
      _id: joi.string().allow(null).allow(''),
      name: joi.string().trim().min(1).max(32).required(),
      videoOrientation: joi.string().allow(null).allow(''),
      duration: joi.number(),
      size: joi.number(),
      videoId: joi.string().allow(null).allow('')
    }))
  })

  return joi.validate(data, schemaCurrent)
}

module.exports.validateCreate = (data, defaultDueDate, minDueDate) => {
  const dueDate = moment(+data.dueDate).utc().hours(23).minutes(59)

  const schemaDraft = joi.object().keys({
    name: joi.string().max(128).allow(null).allow(''),
    info: joi.string().allow(null).allow(''),
    dueDate: joi.date().timestamp('javascript').allow(null).default(defaultDueDate),
    videoId: joi.string().allow(null),
    videoOrientation: joi.string().allow(null).allow(''),
    duration: joi.number(),
    size: joi.number(),
    steps: joi.array().items(joi.string().allow(null).allow('')),
    _criterias: joi.array().items(joi.string()),
    canEditVideo: joi.boolean().default(true),
    examples: joi.array().items(joi.object().keys({
      _id: joi.string().allow(null).allow(''),
      name: joi.string().trim().min(1).max(32).required(),
      videoOrientation: joi.string().allow(null).allow(''),
      duration: joi.number(),
      size: joi.number(),
      videoId: joi.string().allow(null).allow('')
    }))
  })

  let result = joi.validate(data, schemaDraft)

  if (!result.value.canEditVideo) {
    result = validateCurrent(data, defaultDueDate)

    if (result.value._criterias.length < 1) {
      throw utils.ErrorHelper.badRequest('ERROR_CRITERIAS_COUNT')
    }
    if (result.value.steps.length < 1) {
      throw utils.ErrorHelper.badRequest('ERROR_JOI_SCENARIO_STEPS')
    }
  }

  if (result.value.name.length > 128) {
    throw utils.ErrorHelper.badRequest('ERROR_JOI_SCENARIO_NAME')
  }
  if (result.value.dueDate && minDueDate.diff(dueDate, 'h') > 1) {
    throw utils.ErrorHelper.badRequest('ERROR_JOI_DUE_DATE')
  }

  if (result.value._criterias && result.value._criterias.length) {
    result.value._criterias.forEach((id) => {
      if (!ObjectId.isValid(id)) {
        throw utils.ErrorHelper.badRequest('ERROR_INVALID_CRITERIA')
      }
    })
  }

  if (result.error) {
    let message = result.error.details[0].message
    if (message.startsWith('_')) {
      message = message.slice(1, message.length)
      throw utils.ErrorHelper.badRequest(message)
    }
    throw utils.ErrorHelper.invalidJoi(result.error)
  }

  return result.value
}

module.exports.validateAssignCoaches = (data) => {
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

module.exports.validateTemplatesToDelete = (data) => {
  const schema = joi.array().items(joi.string()).allow(null)

  const result = joi.validate(data, schema)

  if (result.value.length) {
    result.value.forEach((id) => {
      if (!ObjectId.isValid(id)) {
        throw utils.ErrorHelper.badRequest('ERROR_INVALID_TEMPLATE')
      }
    })
  }

  if (result.error) {
    console.log(result.error)
    throw utils.ErrorHelper.invalidJoi(result.error)
  }

  return result.value
}

module.exports.validateUpdate = (data, defaultDueDate) => {
  const schema = joi.object().keys({
    name: joi.string().max(128).allow(null).allow(''),
    info: joi.string().allow(null).allow(''),
    dueDate: joi.date().timestamp('javascript').allow(null).default(defaultDueDate),
    videoId: joi.string().allow(null),
    videoOrientation: joi.string().allow(null).allow(''),
    duration: joi.number(),
    size: joi.number(),
    steps: joi.array().items(joi.string().allow(null).allow('')),
    _criterias: joi.array().items(joi.string()),
    canEditVideo: joi.boolean().default(true),
    examples: joi.array().items(joi.object().keys({
      _id: joi.string().allow(null).allow(''),
      name: joi.string().trim().min(1).max(32).required(),
      videoOrientation: joi.string().allow(null).allow(''),
      duration: joi.number(),
      size: joi.number(),
      videoId: joi.string().allow(null).allow('')
    }))
  })

  let result = joi.validate(data, schema)
  if (!result.value.canEditVideo) {
    result = validateCurrent(data, defaultDueDate)

    if (result.value._criterias.length < 1) {
      throw utils.ErrorHelper.badRequest('ERROR_CRITERIAS_COUNT')
    }
    if (result.value.steps.length < 1) {
      throw utils.ErrorHelper.badRequest('ERROR_JOI_SCENARIO_STEPS')
    }
  }

  if (result.value.name.length > 128) {
    throw utils.ErrorHelper.badRequest('ERROR_JOI_SCENARIO_NAME')
  }

  if (result.value._criterias && result.value._criterias.length) {
    result.value._criterias.forEach((id) => {
      if (!ObjectId.isValid(id)) {
        throw utils.ErrorHelper.badRequest('ERROR_INVALID_CRITERIA')
      }
    })
  }

  if (result.error) {
    let message = result.error.details[0].message
    if (message.startsWith('_')) {
      message = message.slice(1, message.length)
      throw utils.ErrorHelper.badRequest(message)
    }
    throw utils.ErrorHelper.invalidJoi(result.error)
  }

  return result.value
}

module.exports.copyTemplate = (template) => {
  const scenario = template.toJSON()
  delete scenario._id
  delete scenario.__v
  delete scenario.logs
  delete scenario.isActive
  delete scenario.updatedAt
  delete scenario.createdAt
  scenario.type = template.canEditVideo ? 'draft' : 'current'
  return scenario
}

module.exports.filterGetAll = (templates) => {
  return templates.map(template => {
    return {
      _id: template._id,
      name: template.name,
      createdAt: template.createdAt,
      logs: template.logs.map(log => {
        return {
          user: {
            _id: log.user._id,
            firstName: log.user.firstName,
            lastName: log.user.lastName
          },
          sentAt: log.sentAt
        }
      })
    }
  })
}

module.exports.filterGetOne = (template) => {
  template = template.toJSON()
  delete template.__v
  const filteredLogs = template.logs.map(log => {
    return {
      user: {
        _id: log.user._id,
        firstName: log.user.firstName,
        lastName: log.user.lastName
      },
      sentAt: log.sentAt
    }
  })
  template.logs = filteredLogs
  return template
}
