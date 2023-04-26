'use strict'

const inboxModel = require('../../../models/inbox.model')

module.exports.create = (options) => {
  const data = {
    _user: options._user,
    _recipient: options._recipient,
    isActive: true
  }
  if (options.type) {
    data.type = options.type
  }
  return inboxModel.findOneAndUpdate(data, data, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true
  }).populate({
    path: '_user _recipient',
    match: {isActive: true},
    select: {
      _id: true,
      firstName: true,
      lastName: true,
      avatarId: true,
      avatarColor: true,
      devices: true,
      lang: true,
      messagesCount: true,
      videosCount: true,
      filesCount: true
    }
  }).then((inbox) => {
    inbox.inboxId = 'inboxes/' + inbox._user._id + '/' + inbox._recipient._id + '/' + inbox.id
    return inbox.save()
  }).then((data) => {
    return data
  })
}

module.exports.find = (query) => {
  if (!query) {
    query = {}
  }
  query.isActive = true

  return inboxModel.find(query).sort({ updatedAt: -1 }).populate({
    path: '_user _recipient',
    match: {isActive: true},
    select: {
      _id: true,
      firstName: true,
      lastName: true,
      avatarId: true,
      avatarColor: true,
      devices: true,
      lang: true,
      messagesCount: true,
      videosCount: true
    }
  }).then((inboxes) => {
    return inboxes
  }).catch((err) => {
    throw utils.ErrorHelper.serverError(err)
  })
}

module.exports.findLatestOne = (query) => {
  if (!query) {
    query = {}
  }

  return inboxModel.find(query)
    .sort({ updatedAt: -1 })
    .limit(1)
    .populate({
      path: '_user _recipient',
      match: {isActive: true},
      select: {
        _id: true,
        firstName: true,
        lastName: true,
        avatarId: true,
        avatarColor: true,
        devices: true,
        lang: true,
        messagesCount: true,
        videosCount: true
      }
    }).then((inboxes) => {
      return inboxes[0]
    }).catch((err) => {
      throw utils.ErrorHelper.serverError(err)
    })
}

module.exports.getById = (id) => {
  return inboxModel.findOne({_id: id, isActive: true}).populate({
    path: '_user _recipient',
    match: {isActive: true},
    select: {
      _id: true,
      firstName: true,
      lastName: true,
      avatarId: true,
      avatarColor: true,
      devices: true,
      lang: true,
      messagesCount: true,
      videosCount: true
    }
  }).catch((err) => {
    throw utils.ErrorHelper.serverError(err)
  })
}

module.exports.delete = (query) => {
  query.type = 'inbox'
  return inboxModel.findOne(query).then((inbox) => {
    if (!inbox) {
      return
    }
    inbox.isActive = false
    return inbox.save()
  }).catch((err) => {
    throw utils.ErrorHelper.serverError(err)
  })
}

module.exports.bulkDelete = (query) => {
  query.type = 'inbox'
  return inboxModel.update(
    query,
    {$set: {isActive: false}},
    {multi: true})
}

module.exports.bulkDeleteReal = (query) => {
  query.type = 'inbox'
  return inboxModel.remove(
    query
  )
}

module.exports.bulkDeletePractices = (query) => {
  query.type = 'practice'
  return inboxModel.update(
    query,
    {$set: {isActive: false}},
    {multi: true})
}

module.exports.bulkDeletePracticesReal = (query) => {
  query.type = 'practice'
  return inboxModel.remove(
    query
  )
}

module.exports.update = (id, data) => {
  return inboxModel.findOne({_id: id}).then((inbox) => {
    if (!inbox) {
      return
    }
    inbox.status = data.status
    if (data.status === 'read') {
      inbox.unreadMessagesCount = 0
      inbox.lastReadMessage = data.lastReadMessage
    }
    return inbox.save()
  }).catch((err) => {
    throw utils.ErrorHelper.serverError(err)
  })
}

module.exports.getCountOfUnread = (userId) => {
  return inboxModel.count({
    _user: userId,
    isActive: true,
    status: 'unread'
  })
}
