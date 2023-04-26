'use strict'

const daoScenario = require('../scenario/scenario.dao')
const daoPractice = require('./practice.dao')

module.exports.checkAccessToScenario = (req, res, next) => {
  const user = req.user
  const scenarioId = req.params.scenarioId

  return daoScenario.getById(scenarioId)
    .then((scenario) => {
      if (!scenario) {
        throw utils.ErrorHelper.badRequest('ERROR_INVALID_PRACTICE')
      }
      let scenarioUserExist = false
      scenario._users.forEach((scenarioUser) => {
        if (scenarioUser._id.equals(user._id)) scenarioUserExist = true
      })
      if (!(scenario._coach._id.equals(user._id) || scenarioUserExist)) {
        throw utils.ErrorHelper.forbidden('ERROR_ACCESS_DENIED')
      }
      req.scenario = scenario
      return next()
    })
    .catch((err) => {
      return next(err)
    })
}

module.exports.checkAccess = (req, res, next) => {
  const user = req.user
  const scenarioId = req.params.scenarioId

  return daoScenario.getById(scenarioId)
    .then((scenario) => {
      if (!scenario || scenario.type === 'draft') {
        throw utils.ErrorHelper.badRequest('ERROR_INVALID_PRACTICE')
      }
      let scenarioUserExist = false
      scenario._users.forEach((scenarioUser) => {
        if (scenarioUser._id.equals(user._id)) scenarioUserExist = true
      })
      if (!(scenario._coach._id.equals(user._id) || scenarioUserExist)) {
        throw utils.ErrorHelper.forbidden('ERROR_ACCESS_DENIED')
      }
      return daoPractice.getById(req.params.practiceId)
    })
    .then((practice) => {
      if (!practice) {
        throw utils.ErrorHelper.badRequest('ERROR_INVALID_PRACTICE')
      }
      req.practice = practice
      return next()
    })
    .catch((err) => {
      return next(err)
    })
}
