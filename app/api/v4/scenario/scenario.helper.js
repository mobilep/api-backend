'use strict'

const joi = require('joi')
const admin = require('firebase-admin')
const moment = require('moment')
const firebase = admin.database()
const ObjectId = require('mongoose').Types.ObjectId

const daoPractice = require('./../practice/practice.dao')
const daoCriteria = require('./../criteria/criteria.dao')

const getPracticeStatus = (practice) => {
  // set status
  // New - learner did not send message,
  // In Progress - learner sent message,
  // Complete - user and coach evaluated

  let status = 'New'
  if (practice.userMessagesCount > 0 || practice.userVideosCount > 0) {
    status = 'In Progress'
  }

  const hasLearnerEvaluated = practice.coachMark && practice.coachMark.length > 0
  if (hasLearnerEvaluated) {
    status = 'Complete'
  }
  return status
}

const getWaitingOn = (practice) => {
  const _COACH = 'Coach'
  const _LEARNER = 'Learner'
  const _NOONE = 'No-one'

  const hasLearnerSentMessage = !!(practice.userMessagesCount > 0 || practice.userVideosCount > 0)
  const hasLearnerEvaluated = practice.userMark && practice.userMark.length > 0
  const hasCoachEvaluated = practice.coachMark && practice.coachMark.length > 0
  const lastMessageFrom = practice.lastMessageFrom

  let waitingOn = _NOONE
  if (!hasLearnerSentMessage) {
    waitingOn = _LEARNER
  }

  if (hasLearnerSentMessage && !hasLearnerEvaluated && !hasCoachEvaluated && lastMessageFrom === 'learner') {
    waitingOn = _COACH
  }

  if (hasLearnerSentMessage && !hasLearnerEvaluated && !hasCoachEvaluated && lastMessageFrom === 'coach') {
    waitingOn = _LEARNER
  }

  if (hasLearnerSentMessage && hasCoachEvaluated && !hasLearnerEvaluated) {
    waitingOn = _LEARNER
  }

  if (hasLearnerSentMessage && hasCoachEvaluated) {
    waitingOn = _NOONE
  }

  return waitingOn
}

const getActive = (practice) => {
  const status = getPracticeStatus(practice)
  if (status === 'In Progress' || status === 'Complete') {
    return true
  }
  return false
}

const validateCurrent = (data, defaultDueDate) => {
  const schemaCurrent = joi.object().keys({
    name: joi.string().trim().min(1).max(128).required(),
    info: joi.string().trim().min(1).max(1024).allow(null).allow(''),
    dueDate: joi.date().timestamp('javascript').allow(null).allow('').default(defaultDueDate),
    videoId: joi.string().allow(null).allow(''),
    videoOrientation: joi.string().allow(null).allow(''),
    steps: joi.array().items(joi.string().min(1).max(128).options({ language: {string: { max: '!!_ERROR_JOI_MAX_STEP_LENGTH' }} })).min(1).max(50),
    _criterias: joi.array().items(joi.string().min(1).max(128)).min(1),
    examples: joi.array().items(joi.object().keys({
      _id: joi.string().allow(null).allow(''),
      name: joi.string().trim().min(1).max(32).required(),
      videoOrientation: joi.string().allow(null).allow(''),
      duration: joi.number(),
      size: joi.number(),
      videoId: joi.string().allow(null).allow('')
    })),
    _users: joi.array().items(joi.string()).min(1),
    type: joi.string()
  })

  return joi.validate(data, schemaCurrent)
}

const getCompletedUsers = practices =>
  practices.filter(practise => practise.status === 'complete').length

module.exports.validateCreate = (data, defaultDueDate, minDueDate) => {
  const dueDate = moment(+data.dueDate).utc().hours(23).minutes(59)

  const schema = joi.object().keys({
    name: joi.string().max(128).allow(null).allow(''),
    info: joi.string().allow(null).allow(''),
    dueDate: joi.date().timestamp('javascript').allow(null).default(defaultDueDate),
    videoId: joi.string().allow(null),
    videoOrientation: joi.string().allow(null).allow(''),
    steps: joi.array().items(joi.string().allow(null).allow('')),
    _criterias: joi.array().items(joi.string()),
    examples: joi.array().items(joi.object().keys({
      _id: joi.string().allow(null).allow(''),
      name: joi.string().trim().min(1).max(32).required(),
      videoOrientation: joi.string().allow(null).allow(''),
      duration: joi.number(),
      size: joi.number(),
      videoId: joi.string().allow(null).allow('')
    })),
    _users: joi.array().items(joi.string()),
    type: joi.string().allow(null)
  })

  let result = joi.validate(data, schema)
  if (data.type && data.type === 'current') {
    result = validateCurrent(data, defaultDueDate)
    if (result.value._users.length < 1) {
      throw utils.ErrorHelper.badRequest('ERROR_USERS_COUNT')
    }
    if (result.value._criterias.length < 1) {
      throw utils.ErrorHelper.badRequest('ERROR_CRITERIAS_COUNT')
    }
    if (result.value.steps.length < 1) {
      throw utils.ErrorHelper.badRequest('ERROR_JOI_SCENARIO_STEPS')
    }
    if (result.value.name.length > 128) {
      throw utils.ErrorHelper.badRequest('ERROR_JOI_SCENARIO_NAME')
    }
    if (result.value.dueDate && minDueDate.diff(dueDate, 'h') > 1) {
      throw utils.ErrorHelper.badRequest('ERROR_JOI_DUE_DATE')
    }
  }

  if (result.value._criterias && result.value._criterias.length) {
    result.value._criterias.forEach((id) => {
      if (!ObjectId.isValid(id)) {
        throw utils.ErrorHelper.badRequest('ERROR_INVALID_CRITERIA')
      }
    })
  }
  if (result.value._users && result.value._users.length) {
    result.value._users.forEach((id) => {
      if (!ObjectId.isValid(id)) {
        throw utils.ErrorHelper.badRequest('ERROR_INVALID_USER')
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

module.exports.validateUpdate = (data, defaultDueDate) => {
  const schema = joi.object().keys({
    name: joi.string().max(128).allow(null).allow(''),
    info: joi.string().allow(null).allow(''),
    dueDate: joi.date().timestamp('javascript').allow(null).default(defaultDueDate),
    videoId: joi.string().allow(null),
    videoOrientation: joi.string().allow(null).allow(''),
    steps: joi.array().items(joi.string().allow(null).allow('')),
    _criterias: joi.array().items(joi.string()),
    examples: joi.array().items(joi.object().keys({
      _id: joi.string().allow(null).allow(''),
      name: joi.string().trim().min(1).max(32).required(),
      videoOrientation: joi.string().allow(null).allow(''),
      duration: joi.number(),
      size: joi.number(),
      videoId: joi.string().allow(null).allow('')
    })),
    _users: joi.array().items(joi.string()),
    type: joi.string().allow(null)
  })

  let result = joi.validate(data, schema)
  if (data.type && data.type === 'current') {
    result = validateCurrent(data)
    if (result.value._users.length < 1) {
      throw utils.ErrorHelper.badRequest('ERROR_USERS_COUNT')
    }
    if (result.value._criterias.length < 1) {
      throw utils.ErrorHelper.badRequest('ERROR_CRITERIAS_COUNT')
    }
    if (result.value.steps.length < 1) {
      throw utils.ErrorHelper.badRequest('ERROR_JOI_SCENARIO_STEPS')
    }
    if (result.value.name.length > 128) {
      throw utils.ErrorHelper.badRequest('ERROR_JOI_SCENARIO_NAME')
    }
  }

  if (result.error) {
    let message = result.error.details[0].message
    if (message.startsWith('_')) {
      message = message.slice(1, message.length)
      throw utils.ErrorHelper.badRequest(message)
    } throw utils.ErrorHelper.invalidJoi(result.error)
  }

  return result.value
}

module.exports.validateBestPractice = (data) => {
  const schema = joi.object().keys({
    _id: joi.string().allow(null).allow(''),
    name: joi.string().trim().min(1).max(32).required(),
    videoOrientation: joi.string().allow(null).allow(''),
    duration: joi.number(),
    size: joi.number(),
    videoId: joi.string().allow(null).allow(''),
    _practice: joi.string().allow(null).allow('')
  })

  let result = joi.validate(data, schema)

  if (result.error) {
    if (result.value.name.length > 32) {
      throw utils.ErrorHelper.badRequest('ERROR_BEST_PRACTICE_DESCRIPTION_UPPER')
    }
    throw utils.ErrorHelper.invalidJoi(result.error)
  }

  return result.value
}

module.exports.validateAdminScenario = data => {
  const schema = joi.object().keys({
    companyId: joi.string().allow(null).allow('')
  })

  let result = joi.validate(data, schema)

  if (result.error) {
    throw utils.ErrorHelper.invalidJoi(result.error)
  }

  return {
    companyId: data.companyId
  }
}

module.exports.filterAdminScenariosResponse = scenarios =>
  scenarios.map(scenario => {
    return {
      _id: scenario._id,
      name: scenario.name,
      status: scenario.type === 'complete' ? 'closed' : 'active',
      coach: {
        _id: scenario._coach._id,
        name: `${scenario._coach.firstName} ${scenario._coach.lastName}`,
        firstName: scenario._coach.firstName,
        lastName: scenario._coach.lastName,
        avatarSm: scenario._coach.avatar_sm,
        avatarMd: scenario._coach.avatar_md,
        avatarLg: scenario._coach.avatar_lg,
        avatarColor: scenario._coach.avatarColor
      },
      createdAt: scenario.createdAt,
      userCompleted: getCompletedUsers(scenario.practices),
      userTotal: scenario.practices.length,
      waitingOnLearner: getWaitingOnLearner(scenario.practices),
      waitingOnCoach: getWaitingOnCoach(scenario.practices),
      connections: getActiveUsers(scenario.practices)
    }
  })

const getWaitingOnCoach = practices =>
  practices.filter(practise => getWaitingOn(practise) === 'Coach').length

const getWaitingOnLearner = practices =>
  practices.filter(practise => getWaitingOn(practise) === 'Learner').length

const getActiveUsers = practices =>
  practices.filter(practice => getActive(practice)).length

module.exports.validateAdminScenarioDetails = data => {
  const schema = joi.object().keys({
    companyId: joi.string().allow(null).allow('').required(),
    scenarioId: joi.string().allow(null).allow('').required()
  })

  let result = joi.validate(data, schema)

  if (result.error) {
    throw utils.ErrorHelper.invalidJoi(result.error)
  }

  return {
    scenarioId: data.scenarioId,
    companyId: data.companyId
  }
}

module.exports.getFilterParams = query => query.name ? ({
  name: query.name
}) : null

module.exports.addPracticesToScenarios = async scenarios => {
  const scenarioIds = scenarios.map(s => s._id)

  const scenariosWithPractices = await daoPractice.getByScenarios(scenarioIds)

  const filteredScenarios = []
  scenarios.forEach(s => {
    if (!s._coach) {
      return
    }

    const scenarioWithPractices = scenariosWithPractices.find(sp => String(sp._id) === String(s._id))
    const practices = (scenarioWithPractices) ? scenarioWithPractices.practices : []

    s.practices = practices
    filteredScenarios.push(s)
  })
  return filteredScenarios
}

module.exports.filterAdminScenarioDetails = scenario => {
  if (!scenario) return null
  scenario = scenario.toJSON()
  return {
    name: scenario.name,
    info: scenario.info,
    _company: scenario._company._id,
    coach: {
      _id: scenario._coach._id,
      name: `${scenario._coach.firstName} ${scenario._coach.lastName}`,
      firstName: scenario._coach.firstName,
      lastName: scenario._coach.lastName,
      avatarSm: scenario._coach.avatar_sm,
      avatarMd: scenario._coach.avatar_md,
      avatarLg: scenario._coach.avatar_lg,
      avatarColor: scenario._coach.avatarColor
    },
    video: scenario.video || {},
    steps: scenario.steps,
    criterias: scenario._criterias && scenario._criterias.length ? scenario._criterias.map(criteria => criteria.name) : [],
    bestPractices: scenario.examples && scenario.examples.length ? scenario.examples.map(example => ({
      name: example.name,
      video: example.video
    })) : []
  }
}

module.exports.filterAdminScenarioPractices = async (practices, filter) =>
  practices.length ? Promise.all(practices.map(async practice => {
    practice = practice.toJSON()

    const status = getPracticeStatus(practice)
    const waitingOn = getWaitingOn(practice)
    const connection = getActive(practice)

    return {
      _id: practice._id,
      inboxId: practice._coachInbox ? practice._coachInbox.inboxId : null,
      user: practice._user ? {
        _id: practice._user._id,
        name: `${practice._user.firstName} ${practice._user.lastName}`,
        firstName: practice._user.firstName,
        lastName: practice._user.lastName,
        avatarSm: practice._user.avatar_sm,
        avatarMd: practice._user.avatar_md,
        avatarBg: practice._user.avatar_lg,
        avatarColor: practice._user.avatarColor
      } : {
        name: null,
        avatarSm: null,
        avatarMd: null,
        avatarBg: null
      },
      status: status,
      waitingOn: waitingOn,
      connection: connection,
      userMark: practice.userMark.length
        ? await Promise.all(practice.userMark.map(async mark => ({
          mark: mark.mark,
          criteria: (await daoCriteria.findById(mark._criteria)).name
        })))
        : [],
      coachMark: practice.coachMark.length
        ? await Promise.all(practice.coachMark.map(async mark => ({
          mark: mark.mark,
          criteria: (await daoCriteria.findById(mark._criteria)).name
        })))
        : [],
      coachAvg: practice.coachMark.length ? () => {
        let avgMark = 0
        practice.coachMark.forEach((item) => {
          avgMark += item.mark
        })
        return Math.round(avgMark / practice.coachMark.length * 10) / 10
      } : null,
      hasUserMessage: practice.hasUserMessage
    }
  })) : []

module.exports.filterPractices = (practices, filter) => {
  const testFilter = new RegExp(`${filter.name}`, `i`)
  return practices.filter(practice =>
    practice.user &&
    practice.user.name && testFilter.test(practice.user.name))
}

module.exports.validateGetPracticeMessages = data => {
  const schema = joi.object().keys({
    companyId: joi.string().allow(null).allow('').required(),
    scenarioId: joi.string().allow(null).allow('').required(),
    practiceId: joi.string().allow(null).allow('').required()
  })

  let result = joi.validate(data, schema)

  if (result.error) {
    throw utils.ErrorHelper.invalidJoi(result.error)
  }

  return {
    practiceId: data.practiceId,
    companyId: data.companyId
  }
}

module.exports.getMessageFromFirebase = chatPath =>
  new Promise((resolve, reject) => {
    const ref = firebase.ref(chatPath)
    ref.on('value', data => {
      resolve(data)
    }, error => {
      console.log(error)
      reject(error)
    })
  })

module.exports.pretifyMessages = messageObject => {
  messageObject = messageObject.toJSON()
  if (!messageObject) {
    return []
  }

  return Object.keys(messageObject).map(msg => {
    return messageObject[msg]
  })
}

module.exports.validateUpdateReminder = data => {
  const schema = joi.object().keys({
    reminderIsVisible: joi.boolean().required()
  })

  const result = joi.validate(data, schema)

  if (result.error) {
    throw utils.ErrorHelper.invalidJoi(result.error)
  }

  return result.value
}

module.exports.validateTOMEnrolment = (data) => {
  const schemaCurrent = joi.object().keys({
    name: joi.string().trim().min(1).max(128).required(),
    info: joi.string().trim().min(1).max(1024).allow(null).allow(''),
    dueDate: joi.string().required(),
    videoId: joi.string().allow(null).allow(''),
    videoOrientation: joi.string().allow(null).allow(''),
    steps: joi.array().items(joi.string().min(1).max(128).options({ language: {string: { max: '!!_ERROR_JOI_MAX_STEP_LENGTH' }} })).min(1).max(50),
    _criterias: joi.array().items(joi.string().min(1).max(128)).min(1),
    examples: joi.array().items(joi.object().keys({
      _id: joi.string().allow(null).allow(''),
      name: joi.string().trim().min(1).max(32).required(),
      videoOrientation: joi.string().allow(null).allow(''),
      duration: joi.number(),
      size: joi.number(),
      videoId: joi.string().allow(null).allow('')
    })),
    _users: joi.array().items(joi.string()).min(1),
    type: joi.string()
  })

  const result = joi.validate(data, schemaCurrent, {allowUnknown: true})

  if (result.error) {
    throw utils.ErrorHelper.invalidJoi(result.error)
  }

  return result.value
}
