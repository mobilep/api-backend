'use strict'

const helperInbox = require('./inbox.helper.js')
const daoInbox = require('./inbox.dao')
const daoPractice = require('./../practice/practice.dao')
const _config = require('../../../config/config.js')

const zlib = require('zlib')
const admin = require('firebase-admin')
const db = admin.database()

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
    const practices = await daoPractice.get({_user: req.user._id})
    const response = inboxes.concat(practices)

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

module.exports.getById = (req, res, next) => {
  return Promise.all([
    daoInbox.find(
      {_id: req.params.inboxId, _user: req.user._id, type: 'inbox'}),
    daoPractice.get({_id: req.params.inboxId, _user: req.user._id})
  ])
    .then((inboxes) => {
      return inboxes[0].concat(inboxes[1])
    })
    .then((inboxes) => {
      if (inboxes[0]) {
        return res.json(inboxes[0])
      } else {
        return next(utils.ErrorHelper.badRequest('ERROR_INVALID_INBOX'))
      }
    }).catch((err) => {
      console.log('err', err)
      return next(err)
    })
}

module.exports.update = (req, res, next) => {
  const data = helperInbox.validateEdit(req.body)
  return daoInbox.update(req.param('inboxId'), data).then((inbox) => {
    // make all user inactive if we delete company
    res.json(inbox)
  }).catch((err) => {
    console.log('err', err)
    return next(err)
  })
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
  result.time = (new Date()).getTime()
  if (!result.type) {
    result.type = 'text'
  }
  if (result.type === 'video') {
    const videoId = result.content.videoId
    const videoOrientation = result.content.videoOrientation || 'portrait'
    const duration = result.content.duration || 0
    const size = result.content.size || 0
    result.content = {
      videoId: videoId,
      duration: duration,
      size: size,
      videoOrientation: videoOrientation,
      playList: 'https://s3-' + _config.aws.region + '.amazonaws.com/' +
      _config.aws.videoBucket + '/HLS/' + videoId + '/playlist.m3u8',
      dashList: 'https://s3-' + _config.aws.region + '.amazonaws.com/' +
      _config.aws.videoBucket + '/MPEG-DASH/' + videoId + '/playlist.mpd',
      thumb: 'https://s3-' + _config.aws.region + '.amazonaws.com/' +
      _config.aws.videoBucket + '/HLS/' + videoId + '/thumbs/00001.png'
    }
  }

  return daoInbox.create(
    {_user: req.inbox._recipient, _recipient: req.user._id, type: 'inbox'})
    .then(async (inbox) => {
      if ((result.message && result.message.type === 'video') || result.type === 'video') {
        inbox.videosCount = inbox.videosCount !== undefined
          ? inbox.videosCount + 1
          : 1
      } else {
        req.user.messagesCount++
        inbox.messagesCount = inbox.messagesCount !== undefined
          ? inbox.messagesCount + 1
          : 1
      }
      await req.user.save()
      inbox.message = result
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

module.exports.deleteMessage = (req, res, next) => {
  const inbox = req.inbox
  const messageRef = db.ref(inbox.inboxId).child(req.params.messageId)
  // messageRef.on('value', async (res) => {
  //   const message = res.val()
  //   if (JSON.stringify(req.user._id) === JSON.stringify(message._user)) {
  //     if (inbox.type === 'practice') {
  //       const practice = await daoPractice.getOne({$or: [{_coachInbox: inbox._id}, {_userInbox: inbox._id}]})
  //     } else {
  //       if (message.type === 'video') {
  //         inbox.videosCount--
  //         req.user.videosCount--
  //       } else {
  //         inbox.messagesCount--
  //         req.user.messagesCount--
  //       }
  //       inbox.save()
  //       req.user.save()
  //     }
  //   }
  // })
  return messageRef.remove()
    .then(() => db.ref(inbox.inboxId).once('value'))
    .then((snapshot) => {
      if (req.params.messageId === inbox.message.firebaseKey) {
        inbox.message.content = i18n.__({phrase: 'INBOX_MESSAGE_DELETED', locale: req.user.lang})
        inbox.message.type = 'text'
      }
      if (inbox.type === 'inbox' && snapshot.numChildren() === 0) {
        inbox.message = undefined
      }
      inbox.save()
      return null
    }).then(() => {
      res.sendStatus(204)
    })
    .catch((e) => {
      return next(e)
    })
}
