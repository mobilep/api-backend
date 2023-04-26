'use strict'

const daoScenario = require('../scenario/scenario.dao')

module.exports.checkCoach = (req, res, next) => {
  const user = req.user
  const scenarioId = req.params.scenarioId

  return daoScenario.getById(scenarioId).then((scenario) => {
    if (!scenario) {
      throw utils.ErrorHelper.badRequest('ERROR_INVALID_SCENARIO')
    }

    if (!scenario._coach.equals(user._id)) {
      throw utils.ErrorHelper.forbidden('ERROR_ACCESS_DENIED')
    }
    req.scenario = scenario
    return next()
  }).catch((err) => {
    return next(err)
  })
}
