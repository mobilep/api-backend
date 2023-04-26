'use strict'

const mongoose = require('mongoose')
const _config = require('../config/config.js')

const Schema = mongoose.Schema
/**
 * @apiDefine user User access only
 * This optional description belong to the group user.
 */

const bestPractice = new Schema({
  videoId: {type: String},
  videoOrientation: {type: String, default: 'portrait'},
  duration: {type: Number, default: 0},
  size: {type: Number, default: 0},
  name: {type: String}
})

bestPractice.set('toJSON', {
  transform: function (doc, ret) {
    return _constructVideo(ret)
  }
})

const scenario = new Schema({
  name: {
    type: String,
    trim: true,
    default: ''
  },
  info: {type: String, default: ''},
  dueDate: {type: Date},
  videoId: {type: String},
  videoOrientation: {type: String, default: 'portrait'},
  duration: {type: Number, default: 0},
  size: {type: Number, default: 0},
  steps: [{type: String}],
  _criterias: [{type: Schema.Types.ObjectId, ref: 'Criteria'}],
  examples: [bestPractice],
  groupChat: {type: String},
  chatId: {type: String},
  _coach: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  _users: [{type: Schema.Types.ObjectId, ref: 'User'}],
  _company: {type: Schema.Types.ObjectId, index: true, ref: 'Company'},
  type: {
    type: String,
    enum: ['complete', 'draft', 'current'],
    default: 'draft'
  },
  reminderIsVisible: {type: Boolean},
  isReminderSent: {type: Boolean},
  isPracticed: {type: Boolean},
  isActive: {type: Boolean, default: true},
  canEditVideo: {type: Boolean}
}, {timestamps: true})

scenario.set('toJSON', {
  transform: function (doc, ret) {
    return _constructVideo(ret)
  }
})

function _constructVideo (scenario) {
  const result = scenario
  const prefix = 'https://s3-' + _config.aws.region + '.amazonaws.com/' +
    _config.aws.videoBucket + '/HLS/' + result.videoId

  const prefixDash = 'https://s3-' + _config.aws.region + '.amazonaws.com/' +
    _config.aws.videoBucket + '/MPEG-DASH/' + result.videoId

  try {
    result.video = {
      videoId: result.videoId,
      duration: result.duration,
      size: result.size,
      videoOrientation: result.videoOrientation,
      playList: result.videoId ? prefix + '/playlist.m3u8' : null,
      dashList: result.videoId ? prefixDash + '/playlist.mpd' : null,
      thumb: result.videoId ? prefix + '/thumbs/00001.png' : null
    }
  } catch (e) {
    console.log('ERROR CONSTRUCT VIDEO', e)
  }
  return result
}

scenario.index(
  {
    '_id': 1,
    'isActive': 1
  },
  {
    background: true
  }
)

module.exports = mongoose.model('Scenario', scenario)
