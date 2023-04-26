'use strict'

const EventEmitter = require('events')

class TemplateEventEmitter extends EventEmitter {}

const templateEventEmitter = new TemplateEventEmitter()

const daoInbox = require('./../inbox/inbox.dao')
const userEventEmitter = require('./../user/user.event')

templateEventEmitter.on('sendAssignmentPushNotification', async (scenario, user) => {
  const prop = {
    type: 'SCENARIO_ASSIGNED',
    message: scenario.canEditVideo
      ? i18n.__({phrase: 'DRAFT_ASSIGNED_CAN_EDIT', locale: user.lang})
      : i18n.__({phrase: 'DRAFT_ASSIGNED_CANNOT_EDIT', locale: user.lang}),
    inboxId: scenario._id,
    name: scenario.name
  }

  const count = await daoInbox.getCountOfUnread(user._id)
  if (count > 0) {
    prop.badge = count
  } else {
    prop.badge = 0
  }
  user.devices.forEach((token) => {
    utils.PushNotification.sendPushNotification(token, prop)
  })
  userEventEmitter.userEventEmitter.emit('userMailNotification', user, {}, prop)
})

module.exports.templateEventEmitter = templateEventEmitter
