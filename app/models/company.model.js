'use strict'

const mongoose = require('mongoose')

const Schema = mongoose.Schema

const company = new Schema({
  name: {
    type: String,
    trim: true,
    required: true
  },
  info: {
    type: String
  },
  sendReminder: {
    type: Number,
    default: 3
  },
  isMailNotification: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  integration: {
    name: {
      type: String
    },
    link: {
      type: String
    }
  }

}, {timestamps: true})

module.exports = mongoose.model('Company', company)
