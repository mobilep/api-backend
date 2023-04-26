'use strict'

const mongoose = require('mongoose')

const Schema = mongoose.Schema

const inbox = new Schema({
  inboxId: {type: String},
  _user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  _recipient: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  isActive: {type: Boolean, default: true},
  firstMessageAt: {type: Date, default: null},
  firstResponseAt: {type: Date, default: null},
  message: {
    firebaseKey: {type: String, default: ''},
    _user: {type: Schema.Types.ObjectId, ref: 'User'},
    content: {type: Schema.Types.Mixed},
    type: {
      type: String,
      enum: ['text', 'system-text', 'video', 'image', 'evaluation', 'evaluate', 'welcome', 'file', 'audio'],
      default: 'text'
    },
    time: {type: String}
  },
  lastReadMessage: {type: String},
  status: {
    type: String,
    enum: ['read', 'unread'],
    default: 'unread'
  },
  type: {
    type: String,
    enum: ['inbox', 'practice'],
    default: 'inbox'
  },
  messagesCount: {type: Number},
  unreadMessagesCount: {type: Number, default: 0},
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

module.exports = mongoose.model('Inbox', inbox)
