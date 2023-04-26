'use strict'

const EventEmitter = require('events')

class UserEventEmitter extends EventEmitter {}

const userEventEmitter = new UserEventEmitter()

const daoPractice = require('../practice/practice.dao')
const daoInbox = require('../inbox/inbox.dao')
const daoScenario = require('../scenario/scenario.dao')
const daoUser = require('./user.dao')

userEventEmitter.on('deleteUserProperties', (user) => {
  return Promise.all([
    daoInbox.bulkDelete({$or: [{_user: user}, {_recipient: user}]}),
    daoInbox.bulkDeletePractices({$or: [{_user: user}, {_recipient: user}]}),
    daoScenario.bulkDelete({_coach: user}),
    daoPractice.delete({$or: [{_user: user}, {_coach: user}]})
  ]).catch((e) => {
    console.log(e)
  })
})

userEventEmitter.on('deleteUserPropertiesReal', (user) => {
  return Promise.all([
    daoInbox.bulkDeleteReal({$or: [{_user: user}, {_recipient: user}]}),
    daoInbox.bulkDeletePracticesReal({$or: [{_user: user}, {_recipient: user}]}),
    daoScenario.bulkDeleteReal({_coach: user}),
    daoPractice.deleteReal({$or: [{_user: user}, {_coach: user}]}),
    daoUser.deleteReal({_id: user})
  ]).catch((e) => {
    console.log(e)
  })
})

userEventEmitter.on('assignDemoScenario', (user) => {
  let scenarioId = '574e3a50616165b0b8b55111'
  if (user.lang === 'fr') {
    scenarioId = '574e3a50616165b0b8b55222'
  }

  return daoScenario.addUserToDemoScenario(scenarioId, user._id)
    .then(() => {
      return daoPractice.create({
        _scenario: scenarioId,
        _user: user,
        _coach: '57fe2450916165b0b8b20111'
      })
    })
    .catch((e) => {
      // console.log(e)
    })
})

userEventEmitter.on('userUpdatePN', (user) => {
  if (user.devices.length > 0) {
    user.devices.forEach((token) => {
      utils.PushNotification.userUpdatePN(token)
    })
  }
})

userEventEmitter.on('userMailNotification', async (user, from, prop) => {
  if (user && user._id) {
    const _user = await daoUser.getOne({
      _id: user._id
    })

    let scenarioId = `${prop.inboxId}`
    if (prop.message === 'Video') {
      const checkPractice = await daoPractice.findById(prop.inboxId)
      if (checkPractice) {
        scenarioId = `${checkPractice._scenario}`
        if (['574e3a50616165b0b8b55111', '574e3a50616165b0b8b55222'].includes(scenarioId)) {
          return
        }
      }
    }
    if (prop.welcome) {
      prop.scenario = await daoScenario.getById(prop.inboxId)
    }
    if (_user.email && _user.isMailNotification) {
      utils.Mail.notificationEmail({
        email: _user.email,
        lastName: _user.lastName,
        firstName: _user.firstName,
        lang: _user.lang
      }, from, prop)
    }
  }
})

module.exports.userEventEmitter = userEventEmitter
