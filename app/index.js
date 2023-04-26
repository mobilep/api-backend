'use strict'
require('dotenv').config()
const express = require('express')
const compression = require('compression')
const http = require('http')
const i18n = require('i18n')
const Intercom = require('intercom-client')
const env = process.env.NODE_ENV || 'local'
const _config = require('./config/config.js')
console.log('_config', _config)
const app = express()
app.use(compression())
// Bootstrap application settings
app.set('env', env)

i18n.configure({
  locales: ['en', 'fr', 'ru', 'it', 'es', 'de', 'ja', 'ko', 'ch', 'pt'],
  directory: [__dirname, '/config/locales'].join(''),
  updateFiles: false
})

global.i18n = i18n
// log
if (_config.debug) {
  const morgan = require('morgan')
  app.use(morgan(':method :url :status :response-time'))
}

require('./config/express')(app)

// db connection and settings
const connection = require('./config/connection')
connection.getMongoose()

const admin = require('firebase-admin')
// Fetch the service account key JSON file contents

const serviceAccount = _config.firebase.serviceAccount

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: _config.firebase.databaseURL
})

const utils = require('./utils')
global.utils = utils

Intercom.client = new Intercom.Client({
  token: _config.intercomAccessToken
})

// Routing
app.use('/api/v4', require('./api/v4'))
app.use('/api/v2', require('./api/v2'))
app.use('/api/v1', require('./api/v1'))
app.use('/', require('./api/special'))

// error-handler settings
require('./config/error-handler')(app)

// create server
const port = process.env.PORT || 3000
const server = http.createServer(app)

// run crone events
const cronEvents = require('./api/v1/intercom/cronEvents')
cronEvents.run()

server.listen(port, () => {
  console.log('listening at:', port)
})

server.on('request', () => console.log('healthcheck'))

module.exports = app
