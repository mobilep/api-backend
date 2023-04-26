'use strict'
const _config = require('../../config/config.js')

const EventEmitter = require('events')
const moment = require('moment')
const admin = require('firebase-admin')
const db = admin.database()
const userModel = require('../../models/user.model')
const scenarioModel = require('../../models/scenario.model')
const daoUser = require('../../api/v4/user/user.dao')
const daoPractice = require('../../api/v4/practice/practice.dao')
const daoChat = require('../../api/v4/chat/chat.dao')
// const userEventEmitter = require('../../api/v4/user/user.event')
const PushNotification = require('../pushNotification')

class ChatEventEmitter extends EventEmitter { }
const chatEventEmitter = new ChatEventEmitter()

chatEventEmitter.on('pushChatMessage', async data => {
  const { message, currentUser, chat } = data

  await createMessageContent(message, currentUser, chat)
  await updateCounters(message, currentUser, chat)
  await chat.save()
})

chatEventEmitter.on('sendChatNotification', async data => {
  const { user, chat, currentUser } = data // eslint-disable-line no-unused-vars

  const _user = await daoUser.getById(user._user)

  const prop = {
    type: 'CHAT_MESSAGE',
    name: `${_user.firstName} ${_user.lastName}`,
    inboxId: chat._id,
    chatType: chat.type
  }

  const count = getCountOfUnread(_user._id.toString(), chat)

  prop.badge = count
  if (chat.message.type === 'text' || 'welcome') {
    prop.message = chat.message.content
  }
  if (chat.message.type === 'video') {
    const str = i18n.__({phrase: 'VIDEO', locale: _user.lang})

    prop.message = chat.message.content.text
      ? `${str}, ${chat.message.content.text}` : str
  }
  if (chat.message.type === 'file') {
    const str = i18n.__({phrase: 'FILE', locale: _user.lang})

    prop.message = chat.message.content.text
      ? `${str}, ${chat.message.content.text}` : str
  }
  if (chat.message.type === 'image') {
    const str = i18n.__({phrase: 'PHOTO', locale: _user.lang})

    prop.message = chat.message.content.text
      ? `${str}, ${chat.message.content.text}` : str
  }
  if (chat.message.type === 'audio') {
    const str = i18n.__({phrase: 'AUDIO', locale: _user.lang})

    prop.message = chat.message.content.text
      ? `${str}, ${chat.message.content.text}` : str
  }
  if (chat.message.type === 'system-text' || chat.message.type === 'system-text-link') {
    prop.type = 'SYSTEM_MESSAGE'
    prop.name = 'Mobile Practice'
    prop.message = chat.message.content
  }

  _user.devices.forEach(token => {
    PushNotification.sendPushNotification(token, prop)
  })
  // // disable notification email for mobile users
  // const inactiveEmails = ['system-text', 'system-text-link']
  // if (!_user.devices.length && inactiveEmails.includes(chat.message.type)) {
  //   userEventEmitter.userEventEmitter.emit('userChatMailNotification', currentUser, _user, prop)
  // }
})

chatEventEmitter.on('practiceEvaluated', async (practice, status, chat) => {
  console.log('****practice evaluated****')

  let daysDiff = null

  if (practice._scenario.dueDate) {
    const dueDate = moment(+practice._scenario.dueDate).utc()
    const dateNow = moment().utc()
    daysDiff = dueDate.diff(dateNow, 'd')
  }

  const message = createEvaluationMessage(daysDiff, practice, status)

  const autoMessage = {
    _user: null,
    content: message,
    type: 'system-text',
    time: (new Date()).getTime()
  }

  chatEventEmitter.emit('pushChatMessage', {message: autoMessage, currentUser: practice._user, chat: chat.chat})
})

chatEventEmitter.on('practiceStarted', async (practice, chat) => {
  const practiceStatus = await daoPractice.getPracticeStatus(practice._scenario._id)
  if (practice._scenario.isPracticed === undefined && !practiceStatus.evaluated) {
    console.log('****practice chat opened first time*****')

    await scenarioModel.findByIdAndUpdate(practice._scenario._id, {$set: {isPracticed: true}}, {new: true})

    const autoMessage = {
      _user: null,
      content: i18n.__(
        {phrase: 'CHAT_FIRST_USER_STARTED_PRACTICE', locale: practice._user.lang},
        practice._user.firstName),
      type: 'system-text',
      time: (new Date()).getTime()
    }

    chatEventEmitter.emit('pushChatMessage', {message: autoMessage, currentUser: practice._user, chat: chat.chat})
  }
})

chatEventEmitter.on('reminderSent', async (scenario, user, status, chat) => {
  let daysDiff = null

  if (scenario.dueDate) {
    const dueDate = moment(+scenario.dueDate).utc()
    const dateNow = moment().utc()
    daysDiff = dueDate.diff(dateNow, 'd')
  }

  let message = i18n.__(
    {phrase: 'CHAT_REMINDER', locale: user.lang},
    status.evaluated, status.total, daysDiff)

  if (!daysDiff) {
    message = i18n.__(
      {phrase: 'CHAT_REMINDER_DEFAULT', locale: user.lang},
      status.evaluated, status.total)
  }

  if (daysDiff === 1) {
    message = i18n.__(
      {phrase: 'CHAT_REMINDER_LAST_DAY', locale: user.lang},
      status.evaluated, status.total, daysDiff)
  }
  if (daysDiff === 0) {
    message = i18n.__(
      {phrase: 'CHAT_REMINDER_LESS_ONE_DAY', locale: user.lang},
      status.evaluated, status.total, daysDiff)
  }

  const autoMessage = {
    _user: null,
    content: message,
    type: 'system-text',
    time: (new Date()).getTime()
  }

  chatEventEmitter.emit('pushChatMessage', {message: autoMessage, currentUser: user, chat: chat.chat})
})

chatEventEmitter.on('bestPracticeSaved', async (practiceUser, currentUser, chat) => {
  const autoMessage = {
    _user: null,
    content: i18n.__(
      {phrase: 'BEST_PRACTICE_SAVED', locale: currentUser.lang},
      practiceUser.firstName, practiceUser.firstName),
    type: 'system-text-link',
    time: (new Date()).getTime()
  }

  chatEventEmitter.emit('pushChatMessage', {message: autoMessage, currentUser, chat: chat.chat})
})

chatEventEmitter.on('bestPracticeAdded', async (currentUser, chat) => {
  const autoMessage = {
    _user: null,
    content: i18n.__(
      {phrase: 'BEST_PRACTICE_ADDED', locale: currentUser.lang}),
    type: 'system-text-link',
    time: (new Date()).getTime()
  }

  chatEventEmitter.emit('pushChatMessage', {message: autoMessage, currentUser, chat: chat.chat})
})

function getCountOfUnread (id, chat) {
  const user = chat.users.filter(user => user._user.toString() === id)
  return user[0].unreadMessagesCount
}

chatEventEmitter.on('deleteMPChats', async (query) => {
  try {
    await daoChat.deleteMany(query)
  } catch (err) {
    console.log(err)
  }
})

async function createMessageContent (message, currentUser, chat) {
  switch (message.type) {
    case 'video': {
      const videoId = message.content.videoId
      const videoOrientation = message.content.videoOrientation || 'portrait'
      const duration = message.content.duration || 0
      const size = message.content.size || 0
      const text = message.content.text || ''
      message.content = {
        videoId: videoId,
        duration: duration,
        size: size,
        videoOrientation: videoOrientation,
        playList: 'https://s3-' + _config.aws.region + '.amazonaws.com/' +
                    _config.aws.videoBucket + '/HLS/' + videoId + '/playlist.m3u8',
        dashList: 'https://s3-' + _config.aws.region + '.amazonaws.com/' +
                    _config.aws.videoBucket + '/MPEG-DASH/' + videoId + '/playlist.mpd',
        thumb: 'https://s3-' + _config.aws.region + '.amazonaws.com/' +
                    _config.aws.videoBucket + '/HLS/' + videoId + '/thumbs/00001.png',
        text
      }
      chat.message = message
      getVideoStatusFromFirebase(videoId, async (err, result) => {
        if (!err && !result) { await pushChatMessage(message, currentUser, chat) }
      })
      break
    }

    case 'file': {
      const fileId = message.content.fileId
      const name = message.content.fileName
      const originalName = message.content.originalName
      const size = message.content.size || 0
      const text = message.content.text || ''
      message.content = {
        fileId,
        fileName: name,
        originalName,
        size,
        link: 'https://s3-' + _config.aws.region + '.amazonaws.com/' +
                    _config.aws.fileBucket + '/files/' + name,
        text
      }
      chat.message = message
      getFileStatusFromFirebase(fileId, async (err, result) => {
        if (!err && !result) {
          await pushChatMessage(message, currentUser, chat)
        }
      })
      break
    }

    case 'image': {
      const imageId = message.content.imageId
      const name = message.content.imageName
      const text = message.content.text || ''
      message.content = {
        imageId,
        photoName: name,
        link: 'https://s3-' + _config.aws.region + '.amazonaws.com/' +
                    _config.aws.inboxPhotoBucket + '/public/images/' + name,
        text
      }
      chat.message = message
      getPhotoStatusFromFirebase(imageId, async (err, result) => {
        if (!err && !result) { await pushChatMessage(message, currentUser, chat) }
      })
      break
    }

    case 'audio': {
      const audioId = message.content.audioId
      const size = message.content.size || 0
      const text = message.content.text || ''
      message.content = {
        audioId,
        size,
        link: 'https://s3-' + _config.aws.region + '.amazonaws.com/' +
                _config.aws.audioBucket + '/mp3/' + audioId + '/output/320k.mp3',
        text
      }
      chat.message = message
      getAudioStatusFromFirebase(audioId, async (err, result) => {
        if (!err && !result) { await pushChatMessage(message, currentUser, chat) }
      })
      break
    }

    case 'welcome':
    case 'system-text':
    case 'system-text-link':
    {
      await pushChatMessage(message, currentUser, chat)
      break
    }

    default:
      message.type = 'text'
      await pushChatMessage(message, currentUser, chat)
      break
  }
}

async function updateCounters (result, user, chat) {
  if ((result.message && result.message.type === 'video') || result.type === 'video') {
    chat.videosCount = chat.videosCount !== undefined
      ? chat.videosCount + 1
      : 1
  } else if ((result.message && result.message.type === 'file') || result.type === 'file') {
    chat.filesCount = chat.filesCount !== undefined
      ? chat.filesCount + 1
      : 1
  } else if ((result.message && result.message.type === 'image') || result.type === 'image') {
    chat.photosCount = chat.photosCount !== undefined
      ? chat.photosCount + 1
      : 1
  } else if ((result.message && result.message.type === 'audio') || result.type === 'audio') {
    chat.audiosCount = chat.audiosCount !== undefined
      ? chat.audiosCount + 1
      : 1
  } else {
    await userModel.findByIdAndUpdate(user._id,
      { $inc: { messagesCount: +1 } }, { new: true })
    chat.messagesCount = chat.messagesCount !== undefined
      ? chat.messagesCount + 1
      : 1
  }
}

async function pushChatMessage (result, currentUser, chat) {
  const chatUsers = chat.users.map(u => {
    if (u._user.toString() !== currentUser._id.toString()) {
      u.unreadMessagesCount++
      u.status = 'unread'
    }
    return u._user.toString()
  })

  const messageRef = await db.ref(`mpchat/${chat._id.toString()}/messages`).push(result)
  result.firebaseKey = messageRef.key
  chat.message = result

  const index = chatUsers.indexOf(currentUser._id.toString())
  if (index > -1) {
    chat.users[index].status = 'read'
    chat.users[index].lastReadMessage = result.firebaseKey
  }

  await chat.save()
  const inactiveNotifiactions = ['text', 'image', 'welcome', 'video', 'file', 'audio']
  chat.users.forEach(u => {
    if (u._user.toString() !== currentUser._id.toString() && u.isActive && !inactiveNotifiactions.includes(result.type)) {
      chatEventEmitter.emit('sendChatNotification',
        {user: u, chat, currentUser})
    }
  })
}

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

function createEvaluationMessage (daysDiff, practice, status) {
  let message = i18n.__(
    {phrase: 'CHAT_USER_EVALUATED', locale: practice._user.lang},
    practice._user.firstName,
    status.evaluated,
    status.total,
    daysDiff)

  if (daysDiff === 1) {
    message = i18n.__(
      {phrase: 'CHAT_USER_EVALUATED_LAST_DAY', locale: practice._user.lang},
      practice._user.firstName,
      status.evaluated,
      status.total)
  }
  if (daysDiff === 0) {
    message = i18n.__(
      {phrase: 'CHAT_USER_EVALUATED_LESS_ONE_DAY', locale: practice._user.lang},
      practice._user.firstName,
      status.evaluated,
      status.total)
  }
  if (daysDiff < 0 || !daysDiff) {
    message = i18n.__(
      {phrase: 'CHAT_USER_EVALUATED_PAST_DUE', locale: practice._user.lang},
      practice._user.firstName,
      status.evaluated,
      status.total)
  }
  if (status.evaluated === 1) {
    message = i18n.__(
      {phrase: 'CHAT_FIRST_USER_EVALUATED', locale: practice._user.lang},
      practice._user.firstName)
  }
  return message
}

module.exports.chatEventEmitter = chatEventEmitter
