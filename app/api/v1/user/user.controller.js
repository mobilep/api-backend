'use strict'
const daoUser = require('./user.dao')
const daoPractice = require('./../practice/practice.dao')
const helperUser = require('./user.helper')
const userEventEmitter = require('./user.event').userEventEmitter
const intercomEmitter = require('../intercom/IntercomEmitter')
const daoCompany = require('./../company/company.dao')

module.exports.getMe = (req, res) => {
  const user = req.user
  const result = user.toJSON()
  return Promise.all([
    daoPractice.getMyPractices({_user: req.user._id}),
    daoPractice.getMyScenarios({_coach: req.user._id})]).then(
    async (data) => {
      const company = await daoCompany.getById(req.user._company)
      if (company && company.name) {
        result.companyName = company.name
      }
      result.isManager = !!user.managerCriteria
      const demoScenarious = []
      const practicingScenarios = data[0].filter(e => {
        let id = JSON.stringify(e._scenario._id)
        if (id === JSON.stringify('574e3a50616165b0b8b55111') || id === JSON.stringify('574e3a50616165b0b8b55222')) {
          demoScenarious.push(e)
          return false
        }
        return true
      })
      const createdScenarios = data[1]
      const ps = {
        current: 0,
        completed: 0,
        marks: 0,
        practices: 0,
        avgMark: 0
      }
      const stats = {
        messages_sent: req.user.messagesCount,
        videos_sent: req.user.videosCount
      }
      if (practicingScenarios.length > 0) {
        practicingScenarios.forEach((practice) => {
          if (practice.status === 'complete' && practice.coachMark.length > 0 &&
            practice.userMark.length > 0) {
            ps.completed++
            let practices = 0
            let marks = 0
            practice.coachMark.forEach((coachMark) => {
              marks += coachMark.mark
              practices++
            })
            if (practices > 0) {
              ps.marks += marks / practices
            }
          } else {
            ps.current++
          }
        })
        if (ps.completed) {
          ps.avgMark = ps.marks / ps.completed
        }
      }
      delete ps.practices
      delete ps.marks
      result.practicingScenarios = ps

      const cs = {
        current: 0,
        completed: 0,
        hasUserMarks: 0,
        marks: 0,
        practices: 0,
        avgMark: 0
      }
      if (createdScenarios.length > 0) {
        // createdScenarios.forEach((practice) => {
        //   if (practice.status === 'current') {
        //     cs.current++
        //   } else {
        //     cs.completed++
        //     practice.userMark.forEach((userMark) => {
        //       cs.marks += userMark.mark
        //     })
        //     cs.avgMark = cs.marks / (cs.completed * practice.userMark.length)
        //   }
        // })
        for (let scenario of createdScenarios) {
          if (scenario._scenario.type === 'complete') {
            cs.completed++
          } else {
            cs.current++
          }
          let practices = 0
          let marks = 0
          scenario.practices.forEach((practice) => {
            if (practice.userMark.length > 0) {
              practice.userMark.forEach((userMark) => {
                marks += userMark.mark
                practices++
              })
            }
          })
          if (practices > 0) {
            cs.marks += marks / practices
            cs.hasUserMarks++
          }
        }
        if (cs.hasUserMarks > 0) {
          cs.avgMark = cs.marks / cs.hasUserMarks
        }
      }
      delete cs.marks
      delete cs.practices
      delete cs.hasUserMarks
      result.createdScenarios = cs
      const emiterData = JSON.parse(JSON.stringify(result))
      emiterData.stats = stats
      demoScenarious.forEach(practice => {
        if (practice.status === 'complete' && practice.coachMark.length > 0 &&
          practice.userMark.length > 0) {
          emiterData.practicingScenarios.completed++
        } else {
          emiterData.practicingScenarios.current++
        }
      })
      intercomEmitter.emit('updateUser', emiterData)
      res.json(result)
    })
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
    res.json(users)
  } catch (err) {
    console.log(err)
    res.json([])
  }
}

module.exports.getUser = (req, res, next) => {
  const company = req.company
  const query = {_id: req.param('userId'), _company: company._id}

  return daoUser.getOne(query).then((user) => {
    res.json(user)
  }).catch((err) => {
    console.log('err', err)
    return next(err)
  })
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
      })
      res.sendStatus(204)
    })
    .catch((err) => {
      console.log('err', err)
      return next(err)
    })
}

module.exports.editUser = (req, res, next) => {
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

  return daoUser.edit(req.param('userId'), result)
    .then((user) => {
      res.json(user)
    }).catch((err) => {
      console.log('err', err)
      return next(err)
    })
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
    const user = req.user
    const token = req.body.token
    const endpointArn = await utils.PushNotification.createPlatformEndpoint(token)
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
          endpointArn: endpointArn
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
