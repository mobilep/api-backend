'use strict'

const userModel = require('../../../models/user.model')
// const intercomEmitter = require('../intercom/IntercomEmitter')
const userEventEmitter = require('./../user/user.event').userEventEmitter

module.exports.create = (data) => {
  return userModel.findOne({email: data.email.toLowerCase()}).then((existingEmail) => {
    if (existingEmail) {
      throw utils.ErrorHelper.badRequest('ERROR_EMAIL_EXIST')
    }
    return userModel.create(data)
  })
    .then((rawUser) => userModel.populate(rawUser, '_company'))
    .then((user) => {
      userEventEmitter.emit('assignDemoScenario', user)
      // intercomEmitter.emit('createUser', user)
      return user
    }).then((user) => {
      if (!user) throw utils.ErrorHelper.badRequest('ERROR_INVALID_USER')
      return user.save()
    })
}
