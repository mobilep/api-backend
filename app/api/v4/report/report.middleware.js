'use strict'

const daoPractice = require('../practice/practice.dao')

module.exports.checkScenarioCoach = async (req, res, next) => {
  try {
    const query = {_coach: req.user._id, isActive: true, _user: req.params.userId}
    const practice = await daoPractice.findOne(query)

    if (!practice) {
      throw utils.ErrorHelper.forbidden('ERROR_INVALID_USER')
    }
    return next()
  } catch (err) {
    return next(err)
  }
}
