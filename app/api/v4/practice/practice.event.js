'use strict'

const EventEmitter = require('events')

class PracticeEventEmitter extends EventEmitter {}

const practiceEventEmitter = new PracticeEventEmitter()
const inboxEventEmitter = require('./../inbox/inbox.event').inboxEventEmitter

const daoPractice = require('./practice.dao')
const daoInbox = require('./../inbox/inbox.dao')
const intercomEmitter = require('./../intercom/IntercomEmitter')
const userEventEmitter = require('./../user/user.event')
practiceEventEmitter.on('createChat', (data) => {
  const inbox = data.inbox
  if (!inbox.message.content) {
    return inbox.save()
  }
  let cb = () => null
  const scenario = data.scenario
  if (scenario.videoId) {
    cb = () => {
      const msgTime = (new Date()).getTime()
      inbox.message = {
        _user: scenario._coach._id,
        content: scenario.video,
        type: 'video',
        time: msgTime
      }
      inboxEventEmitter.emit('pushPracticeMessage', {inbox: inbox, practice: data.practice, pushNotification: false})
    }
  }

  // inboxEventEmitter.emit('pushPracticeMessage', {inbox: inbox, practice: data.practice, pushNotification: data.pushNotification})
  inboxEventEmitter.emit('pushPracticeMessage', {inbox: inbox, practice: data.practice, pushNotification: data.pushNotification, cb: cb})
})

practiceEventEmitter.on('checkScenarioType', (scenario) => {
  daoPractice.get({_scenario: scenario._id, status: 'current'})
    .then((practices) => {
      if (practices.length === 0) {
        scenario.type = 'complete'
        scenario.save()
      }
    })
})

practiceEventEmitter.on('sendPushNotification', async (user, message, id) => {
  const prop = {
    type: 'PRACTICE_ASSIGNED',
    message: message,
    inboxId: id
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

practiceEventEmitter.on('sendEvaluationPushNotification', async (user, from, message, id) => {
  const prop = {
    type: 'PRACTICE_EVALUATED',
    message: message,
    inboxId: id,
    name: `${from.firstName} ${from.lastName}`
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
  userEventEmitter.userEventEmitter.emit('userMailNotification', user, from.toJSON(), prop)
})

practiceEventEmitter.on('demoVideo', async (practice) => {
  const msgTime = (new Date()).getTime()

  const m1u = {
    _user: practice._coach._id,
    content: i18n.__({
      duration: 2.368333333333333,
      playList: 'https://s3-eu-west-1.amazonaws.com/mobilepracti...',
      size: 240112,
      thumb: 'https://s3-eu-west-1.amazonaws.com/mobilepracti...',
      videoId: 'BE0A17F7-FFDE-4CE1-AA79-336F6028B8ED',
      videoOrientation: 'landscape'

    }, practice._user.firstName),
    type: 'text',
    time: msgTime
  }
  const m1c = {
    _user: practice._coach._id,
    content: i18n.__({phrase: 'DEMO_SCENARIO_HELLO_MESSAGE', locale: practice._coach.lang}, practice._user.firstName),
    type: 'text',
    time: msgTime
  }
  practice._userInbox.message = m1u
  practice._coachInbox.message = m1c
  inboxEventEmitter.emit('pushInboxMessage', {inbox: practice._userInbox, pushNotification: true})
  inboxEventEmitter.emit('pushInboxMessage', {inbox: practice._coachInbox, pushNotification: false})
})

practiceEventEmitter.on('demoScenarioReplay', async (practice) => {
  const msgTime = (new Date()).getTime()

  const m1u = {
    _user: practice._coach._id,
    content: i18n.__({phrase: 'DEMO_SCENARIO_HELLO_MESSAGE', locale: practice._user.lang}, practice._user.firstName),
    type: 'system-text',
    time: msgTime
  }
  const m1c = {
    _user: practice._coach._id,
    content: i18n.__({phrase: 'DEMO_SCENARIO_HELLO_MESSAGE', locale: practice._coach.lang}, practice._user.firstName),
    type: 'system-text',
    time: msgTime
  }
  practice._userInbox.message = m1u
  practice._coachInbox.message = m1c
  inboxEventEmitter.emit('pushPracticeMessage', {inbox: practice._userInbox, pushNotification: true, practice})
  inboxEventEmitter.emit('pushPracticeMessage', {inbox: practice._coachInbox, pushNotification: false, practice})

  const m2u = {
    _user: practice._coach._id,
    content: i18n.__({phrase: 'DEMO_SCENARIO_EVALUATE', locale: practice._user.lang}),
    type: 'system-text',
    time: msgTime
  }
  const m2c = {
    _user: practice._coach._id,
    content: i18n.__({phrase: 'DEMO_SCENARIO_EVALUATE', locale: practice._coach.lang}),
    type: 'system-text',
    time: msgTime
  }

  practice._userInbox.message = m2u
  practice._coachInbox.message = m2c
  inboxEventEmitter.emit('pushPracticeMessage', {inbox: practice._userInbox, pushNotification: true, practice})
  inboxEventEmitter.emit('pushPracticeMessage', {inbox: practice._coachInbox, pushNotification: false, practice})

  if (practice._scenario._criterias.length > 0) {
    setTimeout(async () => {
      let avgMark = 0
      const result = {
        coachMark: []
      }

      practice._scenario._criterias.forEach((val) => {
        result.coachMark.push({
          _criteria: val,
          mark: 5
        })
      })

      const q = {coachMark: result.coachMark}

      // Send message
      result.coachMark.forEach((val) => {
        avgMark += val.mark
      })
      avgMark = Math.round(avgMark / result.coachMark.length * 10) / 10
      const evaluationMessageUser = {
        _user: practice._coach._id,
        time: (new Date()).getTime(),
        content: {
          text: i18n.__({phrase: 'PRACTICE_EVALUATION_MESSAGE', locale: practice._user.lang}, practice._user.firstName),
          avgMark: avgMark
        },
        type: 'evaluation'
      }
      const evaluationMessageCoach = {
        _user: practice._coach._id,
        time: (new Date()).getTime(),
        content: {
          text: i18n.__({phrase: 'PRACTICE_EVALUATION_MESSAGE', locale: practice._coach.lang}, practice._user.firstName),
          avgMark: avgMark
        },
        type: 'evaluation'
      }
      practice._coachInbox.message = evaluationMessageCoach
      // send once (inbox is the same for coach and user)
      inboxEventEmitter.emit('pushPracticeMessage', {inbox: practice._coachInbox, pushNotification: false, practice: practice})
      practice._userInbox.message = evaluationMessageUser
      practice._userInbox.status = 'unread'
      inboxEventEmitter.emit('pushPracticeMessage', {inbox: practice._userInbox, pushNotification: false, practice: practice})
      const evaluateMessageUser = {
        _user: practice._coach._id,
        time: (new Date()).getTime(),
        content: i18n.__({phrase: 'PRACTICE_WHAT_YOU_THINK', locale: practice._user.lang}),
        type: 'evaluate'
      }
      const evaluateMessageCoach = {
        _user: practice._coach._id,
        time: (new Date()).getTime(),
        content: i18n.__({phrase: 'PRACTICE_WHAT_YOU_THINK', locale: practice._coach.lang}),
        type: 'evaluate'
      }

      practice._coachInbox.message = evaluateMessageCoach
      // send once (inbox is the same for coach and user)
      inboxEventEmitter.emit('pushPracticeMessage', {inbox: practice._coachInbox, pushNotification: false, practice: practice})
      practice._userInbox.message = evaluateMessageUser
      practice._userInbox.status = 'unread'
      inboxEventEmitter.emit('pushPracticeMessage', {inbox: practice._userInbox, pushNotification: false, practice: practice})
      q.status = 'complete'
      // TODO : duplicate inboxes
      intercomEmitter.emit('scenario-coach-evaluates-learner', {practice, avgMark})
      practiceEventEmitter.emit('sendEvaluationPushNotification', practice._user, practice._coach, i18n.__({phrase: 'PRACTICE_RATING_RECEIVED', locale: practice._user.lang}), practice._id)
      await daoPractice.update(practice._id, q)
    }, 5000)
  }
})

practiceEventEmitter.on('demoScenarioEvaluated', (practice) => {
  const msgTime = (new Date()).getTime()
  const m1u = {
    _user: practice._coach._id,
    content: i18n.__({phrase: 'DEMO_SCENARIO_AFTER_EVALUATED', locale: practice._user.lang}),
    type: 'system-text',
    time: msgTime
  }
  const m1c = {
    _user: practice._coach._id,
    content: i18n.__({phrase: 'DEMO_SCENARIO_AFTER_EVALUATED', locale: practice._coach.lang}),
    type: 'system-text',
    time: msgTime
  }
  practice._userInbox.message = m1u
  inboxEventEmitter.emit('pushPracticeMessage', {inbox: practice._userInbox, pushNotification: false, practice: practice})
  practice._coachInbox.message = m1c
  practice._coachInbox.status = 'unread'
  inboxEventEmitter.emit('pushPracticeMessage', {inbox: practice._coachInbox, pushNotification: false, practice: practice})
})

module.exports.practiceEventEmitter = practiceEventEmitter
