'use strict'

const joi = require('joi')
const daoTeam = require('./team.dao')
const daoUser = require('../user/user.dao')

module.exports.validateCreate = (data) => {
  if (!data.name) {
    throw utils.ErrorHelper.badRequest('ERROR_GROUP_NAME_IS_REQUIRED')
  }

  const schema = joi.object().keys({
    name: joi.string().min(1).max(128).required(),
    _users: joi.array().items(joi.string())
  })

  const result = joi.validate(data, schema)

  if (result.error) {
    throw utils.ErrorHelper.invalidJoi(result.error)
  }

  return result.value
}

module.exports.validateEdit = (data) => {
  const schema = joi.object().keys({
    name: joi.string().min(1).max(128),
    _users: joi.array().items(joi.string()).min(1)
  })

  const result = joi.validate(data, schema)

  if (result.error) {
    throw utils.ErrorHelper.invalidJoi(result.error)
  }

  return result.value
}

module.exports.deleteUserFromTeam = (userId, users) => {
  return users.filter(user => user._id.toString() !== userId.toString())
}

module.exports.assignCoach = async (coachEmail, companyId, userId) => {
  if (typeof coachEmail !== 'undefined') {
    const oldTeam = await daoTeam.getDefault({_company: companyId, _users: userId})
    // coach = null
    if (oldTeam) {
      const newUsers = this.deleteUserFromTeam(userId, oldTeam._users)
      oldTeam._users = newUsers
      await oldTeam.save()
    }
    // coach = new coach
    if (coachEmail) {
      const coach = await daoUser.getByEmailAndCompany(coachEmail, companyId)
      if (coach) {
        let newTeam = await daoTeam.getDefault({_company: companyId, _owner: coach._id})
        if (!newTeam) {
          const query = {_owner: coach._id,
            _company: companyId,
            name: `${coach.firstName}.${coach.lastName}`,
            _users: [userId],
            isDefault: true}
          newTeam = await daoTeam.create(query)
        } else {
          await daoTeam.insertUser(newTeam._id, userId)
        }
      } else {
        throw utils.ErrorHelper.badRequest('ERROR_INVALID_COACH')
      }
    }
  }
}

module.exports.deleteFromDefaultTeam = async (userId, companyId, currentTeamId) => {
  const oldTeam = await daoTeam.getDefault({_company: companyId, _users: userId})
  if (oldTeam && (oldTeam._id.toString() !== currentTeamId.toString())) {
    const newUsers = this.deleteUserFromTeam(userId, oldTeam._users)
    oldTeam._users = newUsers
    delete oldTeam.__v
    await oldTeam.save()
  }
}
