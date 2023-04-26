'use strict'

const mongoose = require('mongoose')
const _config = require('../config/config.js')

const Schema = mongoose.Schema
/**
 * @apiDefine user User access only
 * This optional description belong to the group user.
 */
const user = new Schema({

  firstName: {type: String, trim: true, required: true},
  lastName: {type: String, trim: true, required: true},
  email: {
    type: String,
    trim: true,
    unique: true,
    lowercase: true,
    required: true,
    default: ''
  },
  isMailNotification: {type: Boolean, default: true},
  isInviteSent: {type: Boolean, default: false},
  password: {type: String},
  isCompanyAdmin: {type: Boolean, default: false},
  isSysAdmin: {type: Boolean, default: false},
  _company: {type: Schema.Types.ObjectId, ref: 'Company'},
  country: {type: String, required: true},
  postcode: {type: String, trim: true, default: ''},
  lang: {type: String, required: true, enum: ['en', 'fr', 'ru', 'it', 'es', 'de', 'ja', 'ko', 'ch', 'pt'], default: 'en'},
  managerCriteria: {type: String, trim: true, required: false},
  extraInformation: [
    {
      title: {
        type: String,
        enum: [
          'Business Unit',
          'Region',
          'Country Region',
          'Global Region',
          'Custom 1',
          'Custom 2',
          'Custom 3']
      },
      description: {type: String},
      _id: false
    }],
  resetToken: {type: String, default: null},
  magicToken: {type: String, default: null},
  avatarId: {type: String},
  avatarColor: {type: String, default: '58c9ef'},
  isActive: {type: Boolean, default: true},
  devices: [{
    _id: false,
    token: {type: String},
    isAndroid: {type: Boolean},
    endpointArn: {type: String}
  }],
  messagesCount: {type: Number, default: 0},
  videosCount: {type: Number, default: 0},
  filesCount: {type: Number, default: 0},
  photosCount: {type: Number, default: 0},
  audiosCount: {type: Number, default: 0},
  firstLogIn: {type: Date, default: null},
  terms: {type: Boolean, default: false}
}, {usePushEach: true, timestamps: true})

user.path('password').set((value) => {
  if (value === null) {
    return null
  } else {
    return utils.Passport.encryptPassword(value)
  }
})

user.path('email').validate((value) => {
  const emailRegex = utils.Validate.email
  return emailRegex.test(value)
}, 'Please fill a valid email address')

user.set('toJSON', {
  transform: function (doc, ret) {
    const user = _constructAvatarUrls(ret)

    user.havePassword = !!user.password
    user.name = user.firstName + ' ' + user.lastName
    const ei = [
      {
        title: 'Business Unit',
        description: ''
      },
      {
        title: 'Region',
        description: ''
      },
      {
        title: 'Country Region',
        description: ''
      },
      {
        title: 'Global Region',
        description: ''
      },
      {
        title: 'Custom 1',
        description: ''
      },
      {
        title: 'Custom 2',
        description: ''
      },
      {
        title: 'Custom 3',
        description: ''
      }
    ]
    if (user.extraInformation) {
      user.extraInformation.forEach((val) => {
        ei.forEach((eiVal) => {
          if (eiVal.title === val.title) {
            eiVal.description = val.description
          }
        })
      })
    }
    user.extraInformation = ei

    delete user.password
    delete user.resetToken
    delete user.magicToken

    return user
  }
})

function _constructAvatarUrls (user) {
  const result = user
  try {
    result.avatar_sm = result.avatarId
      ? ('https://s3-' + _config.aws.region + '.amazonaws.com/' +
        _config.aws.photoBucket + '/public/' + 100 + '/' + result.avatarId +
        '.jpg') : null
    result.avatar_md = result.avatarId
      ? ('https://s3-' + _config.aws.region + '.amazonaws.com/' +
        _config.aws.photoBucket + '/public/' + 640 + '/' + result.avatarId +
        '.jpg') : null
    result.avatar_lg = result.avatarId
      ? ('https://s3-' + _config.aws.region + '.amazonaws.com/' +
        _config.aws.photoBucket + '/public/' + 1024 + '/' + result.avatarId +
        '.jpg') : null
  } catch (e) {
    console.log('ERROR CONSTRUCT AVATAR', e)
  }
  return result
}

module.exports = mongoose.model('User', user)
