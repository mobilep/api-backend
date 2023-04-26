'use strict'

const mongoose = require('mongoose')

const Schema = mongoose.Schema

const inbox = new Schema({
  users: [
    {
      _id: false,
      _user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
      lastReadMessage: {type: String, default: ''},
      status: {
        type: String,
        enum: ['read', 'unread'],
        default: 'unread'
      },
      isActive: {type: Boolean, default: true},
      unreadMessagesCount: {type: Number, default: 0}
    }
  ],
  title: {type: String},
  chatId: {type: String},
  isActive: {type: Boolean, default: true},
  firstMessageAt: {type: Date, default: null},
  firstResponseAt: {type: Date, default: null},
  _scenario: {type: Schema.Types.ObjectId, ref: 'Scenario', index: true},
  _moderator: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  message: {
    firebaseKey: {type: String, default: ''},
    _user: {type: Schema.Types.ObjectId, ref: 'User'},
    content: {type: Schema.Types.Mixed},
    type: {
      type: String,
      enum: ['text', 'system-text', 'system-text-link', 'video', 'image', 'evaluation', 'evaluate', 'welcome', 'file', 'audio'],
      default: 'text'
    },
    time: {type: String}
  },
  type: {
    type: String,
    enum: ['inbox', 'practice'],
    default: 'inbox'
  },
  messagesCount: {type: Number},
  videosCount: {type: Number},
  filesCount: {type: Number},
  photosCount: {type: Number},
  audiosCount: {type: Number}
}, {timestamps: true})

inbox.index(
  {
    '_id': 1,
    'type': 1,
    'isActive': 1,
    'updatedAt': -1
  },
  {
    background: true
  }
)

module.exports = mongoose.model('mpchat', inbox)
