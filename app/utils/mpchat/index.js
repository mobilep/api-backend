'use strict'

const chatModel = require('../../../app/models/mpchat.model')
const validator = require('./validator')
const i18n = require('i18n')
const admin = require('firebase-admin')
const db = admin.database()

const chatEventEmitter = require('./event').chatEventEmitter

i18n.configure({
  locales: ['en', 'fr'],
  directory: [__dirname, '/../../config/locales'].join(''),
  updateFiles: false
})

/*
firebase /mpchat/{chatId}/messages/
firebase /mpchat/{chatId}/users/

 */
class MPChat {
  constructor (chat = null) {
    this.chat = chat
  }

  async init (chatId) {
    if (chatId) {
      this.chat = await chatModel.findById(chatId)
    }
  }

  async create (params = {}) {
    const result = validator.validateCreate(params)
    this.chat = await chatModel.create(result)
    await db.ref(`mpchat/${this.chat._id.toString()}/`).set({
      users: {
        // userId: true
      },
      messages: [
        {
          // message body
        }
      ]
    })
    this.chat.chatId = `mpchat/${this.chat._id.toString()}`
    await this.chat.save()
  }

  async addUser (users) {
    if (!this.chat) {
      throw new Error('CHAT_IS_UNDEFINED')
    }

    const chatUsers = this.chat.users.map(u => u._user.toString())

    const userIds = []

    users.map(userId => {
      validator.validateId(userId)
      db.ref(`${this.chat.chatId}/users/${userId.toString()}`).set(true)

      if (chatUsers.includes(userId)) {
        const index = chatUsers.indexOf(userId.toString())
        this.chat.users[index].isActive = true
      } else {
        userIds.push({
          _id: true,
          _user: userId.toString()
        })
      }
    })

    await this.chat.save()
    this.chat = await chatModel.findOneAndUpdate(
      { _id: this.chat._id },
      { $addToSet: { users: { $each: userIds } } },
      { new: true })
  }

  async removeUser (userIds) {
    if (!this.chat) {
      throw new Error('CHAT_IS_UNDEFINED')
    }

    this.chat.users.map(user => {
      const userId = user._user.toString()
      validator.validateId(userId)

      if (userIds.includes(userId) && !this.chat._moderator.equals(userId)) {
        user.isActive = false
        user.lastReadMessage = ''
        user.unreadMessagesCount = 0
        user.status = 'unread'
        db.ref(`${this.chat.chatId}/users/${user._user.toString()}`).set(false)
      }
    })

    await this.chat.save()
  }

  async addMessage (message, currentUser) {
    if (!this.chat) {
      throw new Error('CHAT_IS_UNDEFINED')
    }

    const result = validator.validateGroupMessage(message)

    result._user = currentUser._id.toString()
    result.time = (new Date()).getTime()

    chatEventEmitter.emit('pushChatMessage', {message: result, currentUser, chat: this.chat})
  }

  async removeMessage (firebaseId, user) {
    if (!this.chat) {
      throw new Error('CHAT_IS_UNDEFINED')
    }

    // remove from firebase, check lastMessage
    const messageRef = db.ref(`mpchat/${this.chat._id.toString()}/messages`).child(firebaseId)
    const snapshot = await messageRef.once('value')

    if (snapshot.val()) {
      const userId = user._id.toString()
      const firebaseUser = snapshot.val()._user

      if (userId === firebaseUser) {
        await messageRef.remove()
      }
    }

    if (firebaseId === this.chat.message.firebaseKey) {
      this.chat.message.content = i18n.__({phrase: 'INBOX_MESSAGE_DELETED', locale: user.lang})
      this.chat.message.type = 'text'
    }

    await this.chat.save()
  }

  async update (userId, data) {
    if (!this.chat) {
      throw new Error('CHAT_IS_UNDEFINED')
    }

    const result = validator.validateEdit(data)

    const chatUsers = this.chat.users.map(u => u._user.toString())
    const index = chatUsers.indexOf(userId.toString())

    this.chat.title = result.title ? result.title : this.chat.title

    if (result.status) {
      this.chat.users[index].status = result.status

      if (result.status === 'read') {
        this.chat.users[index].unreadMessagesCount = 0
        this.chat.users[index].lastReadMessage = result.lastReadMessage || ''
      }
    }

    await this.chat.save()
  }

  static findAll (params = {}) {
    params.isActive = true

    return chatModel.find(params).populate({
      path: '_moderator users._user',
      select: {
        _id: true,
        isActive: true,
        firstName: true,
        lastName: true,
        avatarId: true,
        avatarColor: true,
        devices: true,
        lang: true,
        messagesCount: true,
        videosCount: true,
        filesCount: true,
        imagesCount: true,
        audiosCount: true
      }
    })
      .populate({
        path: '_scenario',
        select: {
          groupChat: true,
          name: true,
          videoId: true,
          type: true
        }
      })
  }
}

module.exports = MPChat
