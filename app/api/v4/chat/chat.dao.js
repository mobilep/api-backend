'use strict'

const chatModel = require('../../../models/mpchat.model')

module.exports.getById = id => {
  return chatModel.findById(id)
}

module.exports.getChatsWithScenarios = (params, user) => {
  return chatModel.aggregate()
    .match(params)
    .lookup({
      from: 'scenarios',
      localField: '_scenario',
      foreignField: '_id',
      as: '_scenario'
    })
    .unwind('_scenario')
    .lookup({
      from: 'users',
      localField: '_scenario._coach',
      foreignField: '_id',
      as: '_scenario._coach'
    })
    .unwind({
      path: '$_scenario._users',
      preserveNullAndEmptyArrays: true
    })
    .lookup({
      from: 'users',
      localField: '_scenario._users',
      foreignField: '_id',
      as: '_scenario._users'
    })
    .unwind({
      path: '$_scenario._users',
      preserveNullAndEmptyArrays: true
    })
    .unwind({
      path: '$_scenario._coach',
      preserveNullAndEmptyArrays: true
    })
    .group({
      _id: '$_id',
      _users: { $push: '$_scenario._users' },
      _scenario: { $first: '$$ROOT' }
    })
    .addFields({
      '_scenario._scenario._users': '$_users'
    })
    .project({
      _id: '$_scenario'
    })
    .unwind({
      path: '$_id.users',
      preserveNullAndEmptyArrays: true
    })
    .lookup({
      from: 'users',
      localField: '_id.users._user',
      foreignField: '_id',
      as: '_id.users._user'
    })
    .unwind({
      path: '$_id.users._user',
      preserveNullAndEmptyArrays: true
    })
    .lookup({
      from: 'users',
      localField: '_id._moderator',
      foreignField: '_id',
      as: '_id._moderator'
    })
    .unwind({
      path: '$_id._moderator',
      preserveNullAndEmptyArrays: true
    })
    .group({
      _id: '$_id._id',
      users: { $push: '$_id.users' },
      chat: { $first: '$$ROOT' }
    })
    .addFields({
      'chat._id.users': '$users'
    })
    .project({
      _id: '$chat._id'
    })
    .unwind({
      path: '$_id._scenario._criterias',
      preserveNullAndEmptyArrays: true
    })
    .lookup({
      from: 'criterias',
      localField: '_id._scenario._criterias',
      foreignField: '_id',
      as: '_id._scenario._criterias'
    })
    .unwind({
      path: '$_id._scenario._criterias',
      preserveNullAndEmptyArrays: true
    })
    .group({
      _id: '$_id._scenario._id',
      criterias: { $push: '$_id._scenario._criterias' },
      data: { $first: '$$ROOT' }
    })
    .addFields({
      'data._id._scenario._criterias': '$criterias'
    })
    .project({
      _id: '$data._id'
    })
    .addFields({
      'currentUser': {
        $filter: {
          input: '$_id.users',
          as: 'user',
          cond: { $eq: ['$$user._user._id', user] }
        }
      }
    })
    .unwind('currentUser')
    .sort({ 'currentUser.unreadMessagesCount': -1 })
    .addFields({
      '_id._scenario.unreadMessagesGroupChat': '$currentUser.unreadMessagesCount' // for current user
    })
    .addFields({
      'currentUser': '$$REMOVE'
    })
}

module.exports.delete = (chatId) => {
  const query = {
    _id: chatId,
    type: 'inbox'
  }

  return chatModel.findOneAndUpdate(query, { isActive: false }, { new: true })
}

module.exports.deleteMany = (query) => {
  return chatModel.updateMany(query, {isActive: false})
}
