'use strict'

const userEventEmitter = require('./../user/user.event')
const EventEmitter = require('events')

class InboxEventEmitter extends EventEmitter {}

const inboxEventEmitter = new InboxEventEmitter()

const admin = require('firebase-admin')
const db = admin.database()

const daoInbox = require('./inbox.dao')
const intercomEmitter = require('../intercom/IntercomEmitter')

const convertMessage = (msg) => {
  return {
    _user: msg._user.toString(),
    content: msg.content,
    time: msg.time,
    type: msg.type
  }
}

inboxEventEmitter.on('pushInboxMessage', (data) => {
  const inbox = data.inbox
  if (!inbox.message.content) {
    return inbox.save()
  }
  const message = convertMessage(inbox.message)
  if (data.pushNotification) { // recipient
    inbox.status = 'unread'
    if (inbox.message.type === 'video') {
      getVideoStatusFromFirebase(inbox.message.content.videoId, async (err, result) => {
        if (!result) {
          await pushMessage(inbox, message, data)
          const user = inbox._recipient
          console.log('Push Inbox Video')
          user.videosCount = user.videosCount !== undefined ? user.videosCount + 1 : 0
          await user.save()
          await inbox.save()
        }
        if (err) {
          console.log(err)
        }
      })
    }
    if (inbox.message.type === 'file') {
      getFileStatusFromFirebase(inbox.message.content.fileId, async (err, result) => {
        if (!result) {
          await pushMessage(inbox, message, data)
          const user = inbox._recipient
          console.log('Push Inbox File')
          user.filesCount = user.filesCount !== undefined ? user.filesCount + 1 : 0
          await user.save()
          await inbox.save()
        }
        if (err) {
          console.log(err)
        }
      })
    }
    if (inbox.message.type === 'image') {
      getPhotoStatusFromFirebase(inbox.message.content.imageId, async (err, result) => {
        if (!result) {
          await pushMessage(inbox, message, data)
          const user = inbox._recipient
          console.log('Push Inbox Image')
          user.photosCount = user.photosCount !== undefined ? user.photosCount + 1 : 0
          await user.save()
          await inbox.save()
        }
        if (err) {
          console.log(err)
        }
      })
    }
    if (inbox.message.type === 'audio') {
      getAudioStatusFromFirebase(inbox.message.content.audioId, async (err, result) => {
        if (!result) {
          await pushMessage(inbox, message, data)
          const user = inbox._recipient
          console.log('Push Inbox Audio')
          user.audiosCount = user.audiosCount !== undefined ? user.audiosCount + 1 : 0
          await user.save()
          await inbox.save()
        }
        if (err) {
          console.log(err)
        }
      })
    }
    if (inbox.message.type === 'text') {
      const newMessageRef = db.ref(inbox.inboxId).push(message)
      inbox.message.firebaseKey = newMessageRef.key
      inboxEventEmitter.emit('sendInboxNotification', inbox)
      inbox.save().then(data.cb)
    }
  } else { // me
    const newMessageRef = db.ref(inbox.inboxId).push(message)
    inbox.message.firebaseKey = newMessageRef.key
    inbox.save()
  }
})

inboxEventEmitter.on('pushPracticeMessage', (data) => {
  const inbox = data.inbox
  const practice = data.practice
  const content = data.content
  if (!inbox.message.content) {
    return inbox.save()
  }
  if (data.canBeFirstMsg && !inbox.firstMessageAt) {
    inbox.firstMessageAt = new Date()
  }
  if (!inbox.firstResponseAt &&
    data.canBeResponseMsg &&
    inbox.firstMessageAt &&
    (inbox._user._id.toString() !== inbox.message._user.toString())) {
    inbox.firstResponseAt = new Date()
  }
  const message = convertMessage(inbox.message)
  if (data.pushNotification) { // recipient
    inbox.status = 'unread'
    if (inbox.message.type === 'video') {
      getVideoStatusFromFirebase(inbox.message.content.videoId, async (err, result) => {
        const user = practice._coachInbox._id.equals(inbox._id) ? practice._user : practice._coach
        if (!err && !result) {
          const newMessageRef = db.ref(inbox.inboxId).push(message)
          inbox.message.firebaseKey = newMessageRef.key
          inboxEventEmitter.emit('sendPracticeMessage', inbox, data.practice)
          console.log('Push Practice Video')
          user.videosCount = user.videosCount !== undefined ? user.videosCount + 1 : 0
          await user.save()
          await inbox.save()
          if (data.cb) {
            data.cb()
          }
        }
        if (!err && result) {
          if (user._id.equals(practice._coach._id)) {
            intercomEmitter.emit('scenario-video-uploaded-by-coach', {id: user._id, practice: practice, video: content})
          } else {
            intercomEmitter.emit('scenario-video-uploaded-by-learner', {id: user._id, practice: practice, video: content})
          }
        }
      })
    } else { // text
      const newMessageRef = db.ref(inbox.inboxId).push(message)
      inbox.message.firebaseKey = newMessageRef.key
      inboxEventEmitter.emit('sendPracticeMessage', inbox, data.practice)
      inbox.save().then(data.cb)
    }
  } else { // me
    const newMessageRef = db.ref(inbox.inboxId).push(message)
    inbox.message.firebaseKey = newMessageRef.key
    inbox.save().then(data.cb)
  }
})

inboxEventEmitter.on('sendInboxNotification', async (inbox) => {
  const inboxJSON = JSON.parse(JSON.stringify(inbox))
  const prop = {
    type: 'INBOX_MESSAGE',
    name: inboxJSON._recipient.firstName + ' ' + inboxJSON._recipient.lastName,
    inboxId: inboxJSON._id,
    inboxType: inboxJSON.type
  }
  const count = await daoInbox.getCountOfUnread(inboxJSON._user._id)
  if (count > 0) {
    prop.badge = count
  } else {
    prop.badge = 0
  }
  if (inboxJSON.message.type === 'text' || 'welcome') {
    prop.message = inboxJSON.message.content
  }
  if (inboxJSON.message.type === 'video') {
    const str = i18n.__({phrase: 'VIDEO', locale: inboxJSON._user.lang})

    prop.message = inboxJSON.message.content.text
      ? `${str}, ${inboxJSON.message.content.text}` : str
  }
  if (inboxJSON.message.type === 'file') {
    const str = i18n.__({phrase: 'FILE', locale: inboxJSON._user.lang})

    prop.message = inboxJSON.message.content.text
      ? `${str}, ${inboxJSON.message.content.text}` : str
  }
  if (inboxJSON.message.type === 'image') {
    const str = i18n.__({phrase: 'PHOTO', locale: inboxJSON._user.lang})

    prop.message = inboxJSON.message.content.text
      ? `${str}, ${inboxJSON.message.content.text}` : str
  }
  if (inboxJSON.message.type === 'audio') {
    const str = i18n.__({phrase: 'AUDIO', locale: inboxJSON._user.lang})

    prop.message = inboxJSON.message.content.text
      ? `${str}, ${inboxJSON.message.content.text}` : str
  }

  inboxJSON._user.devices.forEach((token) => {
    utils.PushNotification.sendPushNotification(token, prop)
  })
  if (!inboxJSON._user.devices.length) { // send email in case user does not use mobile app
    userEventEmitter.userEventEmitter.emit('userMailNotification', inboxJSON._user, inboxJSON._recipient, prop)
  }
})

inboxEventEmitter.on('sendPracticeMessage', async (inbox, practice) => {
  let shouldSendEmail = true
  const inboxJSON = JSON.parse(JSON.stringify(inbox))
  console.log('*** sendPracticeMessage ***')
  const prop = {
    type: 'INBOX_MESSAGE',
    name: inboxJSON._recipient.firstName + ' ' + inboxJSON._recipient.lastName,
    inboxId: practice._id,
    inboxType: practice.type
  }
  const count = await daoInbox.getCountOfUnread(inboxJSON._user._id)
  if (count > 0) {
    prop.badge = count
  } else {
    prop.badge = 0
  }
  if (inboxJSON.message.type === 'text') {
    prop.message = inboxJSON.message.content
  }
  if (inboxJSON.message.type === 'welcome') {
    prop.welcome = true
    prop.type = 'PRACTICE_ASSIGNED'
    prop.inboxId = practice._scenario._id
    prop.message = inboxJSON._recipient.firstName + ' ' + inboxJSON._recipient.lastName
    prop.name = i18n.__(
      {phrase: 'PRACTICE_WELCOME_MESSAGE_NOTIFICATION', locale: inboxJSON._user.lang},
      practice._scenario.name)

    // while assign to scenario, don't send email if it is demo scenario
    if (['574e3a50616165b0b8b55111', '574e3a50616165b0b8b55222'].includes(practice._scenario._id.toString())) {
      shouldSendEmail = false
    }
  }
  if (inboxJSON.message.type === 'video') {
    const str = i18n.__({phrase: 'VIDEO', locale: inboxJSON._user.lang})

    prop.message = inboxJSON.message.content.text
      ? `${str}, ${inboxJSON.message.content.text}` : str
  }
  if (inboxJSON.message.type === 'file') {
    const str = i18n.__({phrase: 'FILE', locale: inboxJSON._user.lang})

    prop.message = inboxJSON.message.content.text
      ? `${str}, ${inboxJSON.message.content.text}` : str
  }
  if (inboxJSON.message.type === 'image') {
    const str = i18n.__({phrase: 'PHOTO', locale: inboxJSON._user.lang})

    prop.message = inboxJSON.message.content.text
      ? `${str}, ${inboxJSON.message.content.text}` : str
  }
  if (inboxJSON.message.type === 'audio') {
    const str = i18n.__({phrase: 'AUDIO', locale: inboxJSON._user.lang})

    prop.message = inboxJSON.message.content.text
      ? `${str}, ${inboxJSON.message.content.text}` : str
  }

  inboxJSON._user.devices.forEach((token) => {
    utils.PushNotification.sendPushNotification(token, prop)
  })

  if (inboxJSON._user.devices.length && ['text', 'video', 'file', 'image', 'audio'].includes(inboxJSON.message.type)) {
    shouldSendEmail = false // send email in case user does not use mobile app
  }

  if (shouldSendEmail) {
    userEventEmitter.userEventEmitter.emit('userMailNotification', inboxJSON._user, inboxJSON._recipient, prop)
  }
})

inboxEventEmitter.on('bestPracticeSavedNotification', async (practice) => {
  const inbox = practice._userInbox
  const name = practice._coach.firstName + ' ' + practice._coach.lastName
  const prop = {
    type: 'BEST_PRACTICE_SAVED',
    name: practice._scenario.name,
    inboxId: practice._id
  }
  const count = await daoInbox.getCountOfUnread(inbox._user._id)
  if (count > 0) {
    prop.badge = count
  } else {
    prop.badge = 0
  }
  prop.message = i18n.__(
    {phrase: 'INBOX_BEST_PRACTICE_NOTIFICATION', locale: practice._user.lang},
    practice._scenario.name)
  const inboxMessageUser = {
    _user: practice._coach._id,
    content: i18n.__(
      {phrase: 'INBOX_BEST_PRACTICE_MESSAGE', locale: practice._user.lang}),
    time: (new Date()).getTime(),
    type: 'system-text'
  }
  const inboxMessageCoach = {
    _user: practice._coach._id,
    content: i18n.__(
      {phrase: 'INBOX_BEST_PRACTICE_MESSAGE', locale: practice._coach.lang}),
    time: (new Date()).getTime(),
    type: 'system-text'
  }
  practice._userInbox.status = 'unread'
  practice._userInbox.message = inboxMessageUser
  practice._coachInbox.message = inboxMessageCoach
  inboxEventEmitter.emit('pushInboxMessage',
    {inbox: practice._userInbox, pushNotification: false})
  inboxEventEmitter.emit('pushInboxMessage',
    {inbox: practice._coachInbox, pushNotification: false})
  practice._user.devices.forEach((token) => {
    utils.PushNotification.sendPushNotification(token, prop)
  })
  practice._coach.name = name
  if (!practice._user.devices.length) {
    userEventEmitter.userEventEmitter.emit('userMailNotification', practice._user, practice._coach, prop)
  }
})

function getVideoStatusFromFirebase (videoId, cb) {
  const ref = db.ref('videos/' + videoId)
  const subscription = ref.on('value', (snapshot) => {
    const val = snapshot.val()
    if (val) {
      if (val.state === 'PROCESSING') {
        console.log('PROCESSSING')
        cb(null, val)
      }
      if (val.state === 'COMPLETED') {
        console.log('DONE')
        ref.off('value', subscription, this)
        cb(null)
      }
      if (val.state === 'ERROR') {
        console.log('ERROR')
        ref.off('value', subscription, this)
        cb(val, null)
      }
    }
  }, (errorObject) => {
    cb(errorObject, null)
  })
}

function getFileStatusFromFirebase (fileId, cb) {
  const ref = db.ref('files/' + fileId)
  const subscription = ref.on('value', (snapshot) => {
    const val = snapshot.val()
    if (val) {
      if (val.state === 'COMPLETED') {
        console.log('DONE')
        ref.off('value', subscription, this)
        cb(null)
      }
      if (val.state === 'ERROR') {
        console.log('ERROR')
        ref.off('value', subscription, this)
        cb(val, null)
      }
    }
  }, (errorObject) => {
    cb(errorObject, null)
  })
}

function getPhotoStatusFromFirebase (imageId, cb) {
  const ref = db.ref('images/' + imageId)
  const subscription = ref.on('value', (snapshot) => {
    const val = snapshot.val()
    console.log(val)
    if (val) {
      if (val.state === 'PROCESSING') {
        console.log('PROCESSSING')
        cb(null, val)
      }
      if (val.state === 'COMPLETED') {
        console.log('DONE')
        ref.off('value', subscription, this)
        cb(null)
      }
      if (val.state === 'ERROR') {
        console.log('ERROR')
        ref.off('value', subscription, this)
        cb(val, null)
      }
    }
  }, (errorObject) => {
    cb(errorObject, null)
  })
}

function getAudioStatusFromFirebase (audioId, cb) {
  const ref = db.ref('audios/' + audioId)
  const subscription = ref.on('value', (snapshot) => {
    const val = snapshot.val()
    console.log(val)
    if (val) {
      if (val.state === 'PROCESSING') {
        console.log('PROCESSSING')
        cb(null, val)
      }
      if (val.state === 'COMPLETED') {
        console.log('DONE')
        ref.off('value', subscription, this)
        cb(null)
      }
      if (val.state === 'ERROR') {
        console.log('ERROR')
        ref.off('value', subscription, this)
        cb(val, null)
      }
    }
  }, (errorObject) => {
    cb(errorObject, null)
  })
}

async function pushMessage (inbox, message, data) {
  const newInbox = await daoInbox.create({
    _user: inbox._user._id,
    _recipient: inbox._recipient._id,
    type: inbox.type
  })
  newInbox.message = message
  newInbox.status = 'unread'
  const newMessageRef = db.ref(newInbox.inboxId).push(message)
  newInbox.message.firebaseKey = newMessageRef.key
  await newInbox.save()
  if (data.cb) {
    data.cb()
  }
  inboxEventEmitter.emit('sendInboxNotification', newInbox)
}

module.exports.inboxEventEmitter = inboxEventEmitter
