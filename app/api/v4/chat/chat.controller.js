'use strict'

const helperChat = require('./chat.helper')
const dto = require('./chat.dto')
const daoChat = require('./chat.dao')
const MPChat = require('../../../utils/mpchat/index')

module.exports.create = async (req, res, next) => {
  try {
    const result = helperChat.validateCreate(req.body)
    const initRecipients = result.recipients ? result.recipients : []
    const currentUserId = req.user._id.toString()
    const newPrivateChat = new MPChat()

    await newPrivateChat.create({ type: 'inbox', _moderator: currentUserId, title: result.title })
    await newPrivateChat.addUser([currentUserId, ...initRecipients])
    const response = await MPChat.findAll({_id: newPrivateChat.chat._id})

    res.json(dto.chat(response[0], req.user._id))
  } catch (err) {
    return next(err)
  }
}

module.exports.getById = async (req, res, next) => {
  try {
    const chat = await MPChat
      .findAll({_id: req.params.chatId})
    if (!chat[0]) {
      throw utils.ErrorHelper.badRequest('ERROR_INVALID_CHAT')
    }
    res.json(dto.chat(chat[0], req.user._id))
  } catch (err) {
    next(err)
  }
}

module.exports.getAll = async (req, res, next) => {
  try {
    const chats = await MPChat.findAll({ users: { $elemMatch: { _user: req.user._id } } })

    res.json(dto.chatList(chats, req.user._id))
  } catch (err) {
    next(err)
  }
}

module.exports.postMessage = async (req, res, next) => {
  try {
    const result = helperChat.validateMessage(req.body)
    const chat = new MPChat(req.chat)
    await chat.addMessage(result, req.user)

    res.sendStatus(204)
  } catch (err) {
    next(err)
  }
}

module.exports.deleteMessage = async (req, res, next) => {
  try {
    const chat = new MPChat(req.chat)
    await chat.removeMessage(req.params.messageId, req.user)

    res.sendStatus(204)
  } catch (err) {
    next(err)
  }
}

module.exports.manageUsers = async (req, res, next) => {
  try {
    const result = helperChat.validateManageUsers(req.body)
    const chat = new MPChat(req.chat)

    const currentUsers = chat.chat.users.map(u => u._user.toString())
    const usersToRemove = currentUsers.filter(u => !result.users.includes(u))
    const usersToAdd = result.users.filter(u => !usersToRemove.includes(u))

    await chat.addUser(usersToAdd)
    await chat.removeUser(usersToRemove)

    const response = await MPChat.findAll({_id: chat.chat._id})
    res.json(dto.chat(response[0], req.user._id))
  } catch (err) {
    next(err)
  }
}

module.exports.edit = async (req, res, next) => {
  const chat = new MPChat(req.chat)

  try {
    const result = helperChat.validateEdit(req.body)

    const dataToUpdate = Object.assign({}, result)
    delete dataToUpdate.users
    await chat.update(req.user._id, dataToUpdate)

    if (result.hasOwnProperty('users')) {
      const currentUsers = chat.chat.users.map(u => u._user.toString())
      const usersToRemove = currentUsers.filter(u => !result.users.includes(u))
      const usersToAdd = result.users.filter(u => !usersToRemove.includes(u))

      await chat.addUser(usersToAdd)
      await chat.removeUser(usersToRemove)
    }

    const response = await MPChat.findAll({_id: chat.chat._id})
    res.json(dto.chat(response[0], req.user._id))
  } catch (err) {
    next(err)
  }
}

module.exports.delete = async (req, res, next) => {
  try {
    await daoChat.delete(req.params.chatId)
    res.sendStatus(204)
  } catch (err) {
    return next(err)
  }
}
