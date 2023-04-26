'use strict'

const _config = require('./config/config.js')
const path = require('path')
const admin = require('firebase-admin')
const i18n = require('i18n')

const serviceAccount = _config.firebase.serviceAccount
console.log('serviceAccount', serviceAccount)
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: _config.firebase.databaseURL
})
const utils = require('./utils')

global.utils = utils
global.i18n = i18n

if (_config.seed) {
  // db connection and settings
  const connection = require('./config/connection')
  const mongoose = connection.getMongoose()

  const seedsPath = path.join(__dirname, './seeds')
  const apiPath = path.join(__dirname, './api/v1')

  const mongooseHelper = require('./utils/mongooseHelper')

  const options = {
    seeds: seedsPath,
    apiPath: apiPath,
    appPath: __dirname,
    mongoose: mongoose
  }

  mongooseHelper.seedDatabase(options).then(() => {
    process.exit()
  }).catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
