'use strict'

const daoTeam = require('./team.dao')

module.exports.checkOwner = (req, res, next) => {
  const user = req.user
  const teamId = req.params.teamId

  return daoTeam.getById(teamId).then((team) => {
    if (!team) {
      throw utils.ErrorHelper.badRequest('ERROR_INVALID_TEAM')
    }

    if (!team._owner.equals(user._id)) {
      throw utils.ErrorHelper.forbidden('ERROR_ACCESS_DENIED')
    }

    if (!team._company.equals(req.company._id)) {
      throw utils.ErrorHelper.forbidden('ERROR_ACCESS_DENIED')
    }
    req.team = team
    return next()
  }).catch((err) => {
    return next(err)
  })
}
