'use strict'
const mongoose = require('mongoose')

const _config = require('./../config/config.js')

mongoose.set('debug', _config.debug)
mongoose.Promise = global.Promise

module.exports.connect = (cb) => {
  return mongoose.connect(_config.database, {useMongoClient: true}, cb)
}

module.exports.disconnect = () => {
  return mongoose.disconnect()
}

module.exports.getMongoose = () => {
  this.disconnect()
  this.connect()
  return mongoose
}
