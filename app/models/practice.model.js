'use strict'

const mongoose = require('mongoose')

const Schema = mongoose.Schema
/**
 * @apiDefine user User access only
 * This optional description belong to the group user.
 */
const practice = new Schema({
  _coach: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  _user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  _scenario: {type: Schema.Types.ObjectId, ref: 'Scenario', index: true, required: true},
  _userInbox: {type: Schema.Types.ObjectId, ref: 'Inbox', required: true},
  _coachInbox: {type: Schema.Types.ObjectId, ref: 'Inbox', required: true},
  chatId: {type: String},
  userMessagesCount: {type: Schema.Types.Number, default: 0},
  userVideosCount: {type: Schema.Types.Number, default: 0},
  userFilesCount: {type: Schema.Types.Number, default: 0},
  userPhotosCount: {type: Schema.Types.Number, default: 0},
  userAudiosCount: {type: Schema.Types.Number, default: 0},
  userFirstVideoAt: {type: Date, default: null},
  coachMessagesCount: {type: Schema.Types.Number, default: 0},
  coachVideosCount: {type: Schema.Types.Number, default: 0},
  coachFilesCount: {type: Schema.Types.Number, default: 0},
  coachPhotosCount: {type: Schema.Types.Number, default: 0},
  coachAudiosCount: {type: Schema.Types.Number, default: 0},
  userMark: [
    {
      _criteria: {type: Schema.Types.ObjectId, ref: 'Criteria'},
      mark: {type: Number},
      _id: false
    }],
  coachMark: [
    {
      _criteria: {type: Schema.Types.ObjectId, ref: 'Criteria'},
      mark: {type: Number},
      _id: false
    }],
  status: {type: String, enum: ['complete', 'current'], default: 'current'},
  lastMessageFrom: {type: String, enum: ['coach', 'learner'], default: 'coach'},
  isActive: {type: Boolean, default: true},
  hasUserMessage: {type: Boolean, default: false},
  hasBestPractice: {type: Boolean, default: false},
  coachEvaluatedAt: {type: Date, default: null},
  userEvaluatedAt: {type: Date, default: null}
}, {timestamps: true})

practice.index(
  {
    '_id': 1,
    '_coach': 1,
    '_user': 1,
    'isActive': 1
  },
  {
    background: true
  }
)

module.exports = mongoose.model('Practice', practice)
