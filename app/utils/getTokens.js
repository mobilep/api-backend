'use strict'
require('../index')
const jwt = require('jsonwebtoken')
const _config = require('../config/config.js')
const daoUser = require('../api/v1/user/user.dao')
let users = [
  'test2+51@techmagic.co',
  'test2+17@techmagic.co',
  'test+2@techmagic.co',
  'test3+1@techmagic.co',
  'test@techmagic.co',
  'test2+35@techmagic.co',
  'test3+50@techmagic.co',
  'test+1@techmagic.co',
  'test2+65@techmagic.co',
  'test2+8@techmagic.co',
  'test3+54@techmagic.co',
  'test3+60@techmagic.co',
  'test3+61@techmagic.co',
  'test3+55@techmagic.co',
  'test2+53@techmagic.co',
  'test3+8@techmagic.co',
  'test3+52@techmagic.co',
  'test2+50@techmagic.co',
  'test2+18@techmagic.co'
]

users = users.map(user => daoUser.getByEmail(user))
Promise.all(users).then(users => {
  users.forEach(user => {
    console.log(module.exports.createAuthToken(user))
  })
})
module.exports.createAuthToken = (user, expiresIn) => {
  const tokenSecret = _config.token
  const tokenPayload = {
    userId: user._id,
    avatarId: user.avatarId
  }

  expiresIn = expiresIn || 24 * 60 * 60 * 30
  return jwt.sign(tokenPayload, tokenSecret, {expiresIn: expiresIn})
}
