'use strict'

const daoChat = require('./chat.dao')

module.exports.checkChatMember = async (req, res, next) => {
  try {
    const currentUserId = req.user._id.toString()
    const chatId = req.params.chatId

    const chat = await daoChat.getById(chatId)
    if (!chat || !chat.isActive) {
      throw utils.ErrorHelper.badRequest('ERROR_INVALID_CHAT')
    }

    const chatUsers = chat.users.map(u => {
      if (u.isActive) {
        return u._user.toString()
      }
    })
    const isMember = chatUsers.includes(currentUserId)

    if (!isMember) {
      throw utils.ErrorHelper.forbidden('ERROR_ACCESS_DENIED')
    }
    req.chat = chat
    next()
  } catch (err) {
    next(err)
  }
}

module.exports.checkChatModerator = async (req, res, next) => {
  try {
    const currentUserId = req.user._id.toString()
    const chatId = req.params.chatId

    const chat = await daoChat.getById(chatId)
    if (!chat) {
      throw utils.ErrorHelper.badRequest('ERROR_INVALID_CHAT')
    }

    const moderator = chat._moderator.toString()

    if (currentUserId !== moderator) {
      throw utils.ErrorHelper.forbidden('ERROR_ACCESS_DENIED')
    }

    req.chat = chat
    next()
  } catch (err) {
    next(err)
  }
}
