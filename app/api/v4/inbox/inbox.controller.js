'use strict'

const helperInbox = require('./inbox.helper.js')
const daoInbox = require('./inbox.dao')
const daoPractice = require('./../practice/practice.dao')
const MPChat = require('../../../utils/mpchat/index')
const dtoChat = require('../chat/chat.dto')
const _config = require('../../../config/config.js')

const zlib = require('zlib')
const admin = require('firebase-admin')
const db = admin.database()
const _ = require('lodash')

const inboxEventEmitter = require('./inbox.event').inboxEventEmitter

module.exports.create = (req, res, next) => {
  const result = helperInbox.validateCreate(req.body)
  return daoInbox.create({
    _user: req.user._id.toString(),
    _recipient: result._recipient,
    type: 'inbox'
  }).then((inbox) => {
    res.json(inbox)
  }).catch((err) => {
    return next(err)
  })
}

module.exports.getAll = (req, res, next) => {
  return Promise.all([
    daoInbox.find({_user: req.user._id, type: 'inbox'}),
    daoPractice.get({_user: req.user._id})
  ])
    .then((inboxes) => {
      return inboxes[0].concat(inboxes[1])
    })
    .then((inboxes) => {
      console.log('L', inboxes.length)
      res.json(inboxes)
    }).catch((err) => {
      console.log('err', err)
      return next(err)
    })
}

module.exports.getAllV2 = async (req, res, next) => {
  try {
    const inboxes = await daoInbox.find({_user: req.user._id, type: 'inbox'})
    const chats = await MPChat.findAll({ users: { $elemMatch: { _user: req.user._id, isActive: true } } })
    const practices = await daoPractice.get({_user: req.user._id})
    const practicesWithStatus = addPracticeStatus(practices, req.user._id)
    const response = inboxes.concat(dtoChat.chatList(chats, req.user._id), practicesWithStatus)

    const content = zlib.gzipSync(Buffer.from(JSON.stringify(response)))
    res.writeHead(200, {
      'Content-Encoding': 'gzip',
      'Content-Type': 'application/json',
      'Content-Length': content.length
    })
    res.end(content)
  } catch (error) {
    console.log('err', error)
    return next(error)
  }
}

module.exports.getById = async (req, res, next) => {
  try {
    const inbox = await daoInbox.find(
      { _id: req.params.inboxId, _user: req.user._id, type: 'inbox' })
    const practice = await daoPractice.get({ _id: req.params.inboxId, _user: req.user._id })
    const practicesWithStatus = addPracticeStatus(practice, req.user._id)

    const result = inbox.concat(practicesWithStatus)
    if (!result[0]) {
      return next(utils.ErrorHelper.badRequest('ERROR_INVALID_INBOX'))
    }

    return res.json(result[0])
  } catch (err) {
    console.log('err', err)
    return next(err)
  }
}

module.exports.update = async (req, res, next) => {
  try {
    const data = helperInbox.validateEdit(req.body)
    const inbox = await daoInbox.update(req.param('inboxId'), data)
    // make all user inactive if we delete company
    res.json(inbox)
  } catch (err) {
    console.log('err', err)
    return next(err)
  }
}

module.exports.delete = (req, res, next) => {
  if (req.inbox.type === 'practice') {
    return next(
      utils.ErrorHelper.forbidden('ERROR_ACCESS_DENIED'))
  }
  return daoInbox.delete({_id: req.param('inboxId')}).then(() => {
    res.sendStatus(204)
  }).catch((err) => {
    console.log('err', err)
    return next(err)
  })
}

module.exports.bulkDelete = async (req, res, next) => {
  try {
    const inboxes = []
    const result = helperInbox.validateBulkDelete(req.body)

    for (let inbox of result) {
      inbox = (await daoInbox.find({_id: inbox._id}))[0]
      // if (inbox._recipient && inbox._user) {
      //   if (inbox._recipient._id !== inbox._user._id) {
      //     let myInbox = (await daoInbox.findLatestOne({_user: inbox._recipient._id, _recipient: inbox._user._id}))
      //     if (myInbox && myInbox.type === 'inbox') {
      //       req.user.messagesCount -= myInbox.messagesCount !== undefined ? myInbox.messagesCount : 0
      //       req.user.videosCount -= myInbox.videosCount !== undefined ? myInbox.videosCount : 0
      //
      //       myInbox.messagesCount = 0
      //       myInbox.videosCount = 0
      //       req.user.save()
      //       myInbox.save()
      //     }
      //   } else {
      //     req.user.messagesCount -= inbox.messagesCount !== undefined ? inbox.messagesCount : 0
      //     req.user.videosCount -= inbox.videosCount !== undefined ? inbox.videosCount : 0
      //     inbox.messagesCount = 0
      //     inbox.videosCount = 0
      //   }
      // }
      inboxes.push(inbox._id)
    }
    return daoInbox.bulkDelete({_id: {$in: inboxes}, _user: req.user._id})
      .then(() => {
        res.sendStatus(204)
      })
      .catch((err) => {
        console.log('err', err)
        return next(err)
      })
  } catch (e) {
    console.log(e)
    return next(e)
  }
}

module.exports.postMessage = (req, res, next) => {
  const result = helperInbox.validateInboxMessage(req.body)
  result._user = req.user._id
  createMessage(result)

  return daoInbox.create(
    {_user: req.inbox._recipient, _recipient: req.user._id, type: 'inbox'})
    .then(async (inbox) => {
      incrementCounters(result, inbox, req.user)

      await req.user.save()
      inbox.message = result
      inbox.unreadMessagesCount = inbox.unreadMessagesCount !== undefined
        ? inbox.unreadMessagesCount + 1 : 1
      inbox.status = 'unread'
      req.inbox.message = result
      inboxEventEmitter.emit('pushInboxMessage',
        {inbox: inbox, pushNotification: true}) // recipient
      if (inbox.inboxId !== req.inbox.inboxId) {
        inboxEventEmitter.emit('pushInboxMessage',
          {inbox: req.inbox, pushNotification: false}) // me
      }
      // inboxEventEmitter.emit('sendInboxNotification', inbox)
      // return Promise.all([inbox.save(), req.inbox.save()])

      return res.sendStatus(200)
    })
    .catch((err) => {
      return next(err)
    })
}

module.exports.deleteMessage = async (req, res, next) => {
  try {
    const inbox = req.inbox
    const messageRef = db.ref(inbox.inboxId).child(req.params.messageId)

    const snapshot = await messageRef.once('value')
    const msgDelete = snapshot.val()

    await messageRef.remove()

    const snapshotUserMsgs = await db.ref(inbox.inboxId).once('value')
    const userMsgs = snapshotUserMsgs.val() || {}
    const userMsgsIds = Object.keys(userMsgs)

    if (req.params.messageId === inbox.lastReadMessage) {
      inbox.lastReadMessage = userMsgsIds.length ? userMsgsIds.pop() : null
    }
    await inbox.save()

    let recipientInbox
    if (inbox.type === 'inbox') {
      recipientInbox = await daoInbox.findLatestOne({_user: inbox._recipient, _recipient: inbox._user, type: inbox.type})
    }
    if (inbox.type === 'practice') {
      let practice = await daoPractice.findOne({_coachInbox: inbox._id, isActive: true})
      if (practice) {
        recipientInbox = await daoInbox.getById(practice._userInbox)
      } else {
        practice = await daoPractice.findOne({_userInbox: inbox._id, isActive: true})
        recipientInbox = await daoInbox.getById(practice._coachInbox)
      }
    }

    const snapshotRecipientMsgs = await db.ref(recipientInbox.inboxId).once('value')
    const recipientMsgs = snapshotRecipientMsgs.val()

    const recipientMsgRef = _.findKey(recipientMsgs, msgDelete)

    if (recipientMsgRef) {
      await db.ref(recipientInbox.inboxId).child(recipientMsgRef).set({
        content: i18n.__({phrase: 'INBOX_MESSAGE_DELETED', locale: req.user.lang}),
        time: msgDelete.time,
        type: 'text',
        _user: msgDelete._user
      })
    }

    res.sendStatus(204)
  } catch (err) {
    return next(err)
  }
}

const createMessage = (result) => {
  const size = result.content.size || 0
  const text = result.content.text || ''
  result.time = (new Date()).getTime()

  if (!result.type) {
    result.type = 'text'
  }
  switch (result.type) {
    case 'video':
      const videoId = result.content.videoId
      const videoOrientation = result.content.videoOrientation || 'portrait'
      const duration = result.content.duration || 0
      result.content = {
        videoId: videoId,
        duration: duration,
        size,
        videoOrientation: videoOrientation,
        playList: 'https://s3-' + _config.aws.region + '.amazonaws.com/' +
          _config.aws.videoBucket + '/HLS/' + videoId + '/playlist.m3u8',
        dashList: 'https://s3-' + _config.aws.region + '.amazonaws.com/' +
          _config.aws.videoBucket + '/MPEG-DASH/' + videoId + '/playlist.mpd',
        thumb: 'https://s3-' + _config.aws.region + '.amazonaws.com/' +
          _config.aws.videoBucket + '/HLS/' + videoId + '/thumbs/00001.png',
        text
      }
      break
    case 'file':
      const fileId = result.content.fileId
      const originalName = result.content.originalName
      const fileName = result.content.fileName
      result.content = {
        fileId,
        fileName,
        originalName,
        size,
        link: 'https://s3-' + _config.aws.region + '.amazonaws.com/' +
            _config.aws.fileBucket + '/files/' + fileName,
        text
      }
      break
    case 'image':
      const imageId = result.content.imageId
      const photoName = result.content.imageName
      result.content = {
        imageId,
        photoName,
        link: 'https://s3-' + _config.aws.region + '.amazonaws.com/' +
            _config.aws.inboxPhotoBucket + '/public/images/' + photoName,
        text
      }
      break
    case 'audio':
      const audioId = result.content.audioId
      result.content = {
        audioId,
        size,
        link: 'https://s3-' + _config.aws.region + '.amazonaws.com/' +
            _config.aws.audioBucket + '/mp3/' + audioId + '/output/320k.mp3',
        text
      }
      break
  }
}

const incrementCounters = (result, inbox, user) => {
  if ((result.message && result.message.type === 'video') || result.type === 'video') {
    inbox.videosCount = inbox.videosCount !== undefined
      ? inbox.videosCount + 1
      : 1
  }
  if ((result.message && result.message.type === 'file') || result.type === 'file') {
    inbox.filesCount = inbox.filesCount !== undefined
      ? inbox.filesCount + 1
      : 1
  }
  if ((result.message && result.message.type === 'image') || result.type === 'image') {
    inbox.photosCount = inbox.photosCount !== undefined
      ? inbox.photosCount + 1
      : 1
  }
  if ((result.message && result.message.type === 'audio') || result.type === 'audio') {
    inbox.audiosCount = inbox.audiosCount !== undefined
      ? inbox.audiosCount + 1
      : 1
  } else {
    user.messagesCount++
    inbox.messagesCount = inbox.messagesCount !== undefined
      ? inbox.messagesCount + 1
      : 1
  }
}

const addPracticeStatus = (practices, currentUser) => {
  return practices.map(practice => {
    if (practice._inbox.message.type === 'welcome') {
      practice.state = 'notStarted'
    }
    if (practice.lastMessageFrom === 'coach' && practice._inbox.message.type !== 'welcome') {
      practice.state = 'inProgress'
    }
    if (practice.lastMessageFrom === 'learner') {
      practice.state = 'waitingOnFeedback'
    }
    if (practice.status === 'complete') {
      practice.state = 'completed'
    }
    return practice
  })
}
