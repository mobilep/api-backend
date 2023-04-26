'use strict'
const daoUser = require('./user.dao')
const daoTeam = require('./../team/team.dao')
const dtoUser = require('./user.dto')
const helperUser = require('./user.helper')
const helperTeam = require('./../team/team.helper')
const userEventEmitter = require('./user.event').userEventEmitter
const teamEventEmitter = require('./../team/team.event').teamEventEmitter
const chatEventEmitter = require('../../../utils/mpchat/event').chatEventEmitter
const intercomEmitter = require('../intercom/IntercomEmitter')
const daoCompany = require('./../company/company.dao')

module.exports.getMe = async (req, res) => {
  const user = req.user.toJSON()
  const company = await daoCompany.getById(req.user._company)
  if (company && company.name) {
    user.companyName = company.name
  }
  const result = dtoUser.user(user)
  res.json(result)
}

module.exports.createSysAdmin = (req, res, next) => {
  const result = helperUser.validateCreateSysAdmin(req.body)

  result.isSysAdmin = true

  return daoUser.create(result).then((user) => {
    res.json(user)
  }).catch((err) => {
    console.log('err', err)
    return next(err)
  })
}

module.exports.getUsers = async (req, res, next) => {
  try {
    const company = req.company
    const query = {
      _company: company._id,
      isActive: true,
      filter: ''
    }
    let sort

    if (req.query.filter) {
      query.filter = helperUser.validateSearchQuery(req.query.filter)
    }

    if (req.query.sort) {
      sort = helperUser.validateSortQuery(req.query.sort)
    }

    const userIds = await daoUser.filterBy(query)
    const users = await daoUser.get({_id: {$in: userIds}}, sort)
    const filteredUsers = await helperUser.filterUsersResponse(users, userIds)
    res.json(filteredUsers)
  } catch (err) {
    console.log(err)
    res.json([])
  }
}

module.exports.getUser = async (req, res, next) => {
  try {
    const company = req.company
    const query = {_id: req.params.userId, _company: company._id}
    let user = await daoUser.getOne(query)
    const team = await daoTeam.getDefault({_company: company, _users: user._id})
    user = user.toJSON()

    if (team) {
      user._coach = team._owner.email
    } else {
      user._coach = ''
    }

    res.json(user)
  } catch (err) {
    console.log('err', err)
    return next(err)
  }
}

module.exports.deleteUser = (req, res, next) => {
  const company = req.company
  const query = {_id: req.param('userId'), _company: company._id}

  // user cannot delete himself
  if (req.user._id.toString() === req.param('userId')) {
    return next(utils.ErrorHelper.forbidden())
  }

  return daoUser.delete(query).then(() => {
    intercomEmitter.emit('deleteUser', {id: req.params.userId})
    userEventEmitter.emit('deleteUserProperties', query._id)
    teamEventEmitter.emit('deleteTeams', {_company: company._id, _owner: req.params.userId, isActive: true})
    chatEventEmitter.emit('deleteMPChats', {_moderator: req.params.userId, type: 'practice'})
    res.sendStatus(204)
  }).catch((err) => {
    console.log('err', err)
    return next(err)
  })
}

module.exports.deleteMyself = (req, res, next) => {
  const query = {_id: req.param('userId')}
  if (req.user._id.toString() === req.param('userId')) {
    return daoUser.delete(query).then(() => {
      intercomEmitter.emit('deleteUser', {id: req.params.userId})
      userEventEmitter.emit('deleteUserProperties', query._id)
      teamEventEmitter.emit('deleteTeams', {_owner: req.params.userId, isActive: true})
      chatEventEmitter.emit('deleteMPChats', {_moderator: req.params.userId, type: 'practice'})
      // userEventEmitter.emit('deleteUserPropertiesReal', query._id)
      res.sendStatus(204)
    }).catch((err) => {
      console.log('err', err)
      return next(err)
    })
  } else {
    return next(utils.ErrorHelper.forbidden())
  }
}

module.exports.deleteUsers = (req, res, next) => {
  const company = req.company
  const users = []
  try {
    const result = helperUser.validateBulkDelete(req.body)
    result.forEach((user) => {
      // user cannot delete himself
      if (req.user._id.toString() === user._id) {
        throw utils.ErrorHelper.forbidden('ERROR_DELETE_MYSELF')
      }
      users.push(user._id)
    })
  } catch (e) {
    return next(e)
  }

  return daoUser.bulkDelete({_id: {$in: users}, _company: company._id})
    .then(() => {
      users.forEach((user) => {
        intercomEmitter.emit('deleteUser', {id: user})
        userEventEmitter.emit('deleteUserProperties', user)
        teamEventEmitter.emit('deleteTeams', {_company: company._id, _owner: user, isActive: true})
        chatEventEmitter.emit('deleteMPChats', {_moderator: user, type: 'practice'})
      })
      res.sendStatus(204)
    })
    .catch((err) => {
      console.log('err', err)
      return next(err)
    })
}

module.exports.editUser = async (req, res, next) => {
  try {
    const companyId = req.params.companyId
    const userId = req.params.userId
    const result = helperUser.validateEdit(req.body)
    const keys = Object.keys(result)

    // edit protected fields
    if (!(keys.length === 1 && !!result.avatarId)) {
      if (!(req.user.isCompanyAdmin || req.user.isSysAdmin)) {
        return next(utils.ErrorHelper.forbidden())
      }
    }
    if (!(req.user.isCompanyAdmin || req.user.isSysAdmin)) {
      delete result.isCompanyAdmin
      delete result.password
    }

    await helperTeam.assignCoach(result._coach, companyId, userId)
    let user = await daoUser.edit(req.params.userId, result)
    const team = await daoTeam.getDefault({_company: companyId, _users: userId})
    user = user.toJSON()
    user._coach = team ? team._owner.email : null
    res.json(user)
  } catch (err) {
    console.log('err', err)
    return next(err)
  }
}

module.exports.editMe = (req, res, next) => {
  const result = helperUser.validateEditMe(req.body)
  return daoUser.edit(req.user._id, result)
    .then((user) => {
      res.json(user)
    }).catch((err) => {
      console.log('err', err)
      return next(err)
    })
}

module.exports.editMyTerms = (req, res, next) => {
  const result = helperUser.validateEditTerms(req.body)
  return daoUser.edit(req.user._id, result)
    .then((user) => {
      res.json(user)
    }).catch((err) => {
      console.log('err', err)
      return next(err)
    })
}

module.exports.registerDevice = async (req, res, next) => {
  try {
    const result = helperUser.validateDevice(req.body)
    const user = req.user
    const token = result.token
    const isAndroid = !!result.isAndroid
    const endpointArn = await utils.PushNotification.createPlatformEndpoint(token, isAndroid)

    let tokenIsSet = false
    user.devices.forEach((device) => {
      if (device.token === token) {
        tokenIsSet = true
      }
    })
    if (!tokenIsSet) {
      user.devices.push(
        {
          token: token,
          endpointArn: endpointArn,
          isAndroid
        }
      )
    }
    await user.save()
    res.sendStatus(204)
  } catch (e) {
    console.log(e)
    return next(e)
  }
}

module.exports.deregisterDevice = (req, res, next) => {
  console.log(req.params.token)
  const user = req.user
  const token = req.params.token || ''
  const promises = []
  user.devices.forEach((device) => {
    if (device.token === token) {
      promises.push(daoUser.removeDeviceToken(user._id, token))
      promises.push(utils.PushNotification.deleteEndpoint(device.endpointArn))
    }
  })
  intercomEmitter.emit('user-signs-out', req.user)
  return Promise.all(promises)
    .then(() => {
      res.sendStatus(204)
    })
    .catch((e) => {
      console.log(e)
      next(e)
    })
}
