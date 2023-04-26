'use strict'

const specHelper = require('./spec.helper')
const daoSpec = require('./spec.dao')
const _ = require('lodash')
const casual = require('casual').en_US

module.exports.createUser = (req, res, next) => {
  console.log('*** createUser')
  const users = specHelper.validateInviteUsers(req.body)
  // console.log('users', users)

  const promises = []
  users.forEach((user) => {
    user._company = '5ac33a1eb6c2a8602917029d'
    user.avatarColor = _.sample([
      '58c9ef',
      '2be39c',
      'a457ec',
      'ffbe42',
      'e9d340',
      '3cd861',
      'f946e9',
      '00cdbb',
      'fd524f',
      '6c6ced'])

    user.isActive = true
    user.country = casual.country
    user.postcode = casual.zip()
    user.lang = 'en'
    // user.firstName = casual.first_name
    // user.lastName = casual.last_name
    user.resetToken = null
    user.firstLogIn = new Date()
    promises.push(daoSpec.create(user))
  })

  // res.json({})
  return Promise.all(promises).then((createdUsers) => {
    res.json(createdUsers)
  }).catch((err) => {
    console.log('err', err)
    return next(err)
  })
}
