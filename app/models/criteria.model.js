'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema
/**
 * @apiDefine user User access only
 * This optional description belong to the group user.
 */
const criteria = new Schema({
  name: {
    type: String,
    trim: true,
    required: true
  },
  info: {
    type: String
  },
  isActive: {type: Boolean, default: true},
  _company: {type: Schema.Types.ObjectId, ref: 'Company'}
}, {timestamps: true})

module.exports = mongoose.model('Criteria', criteria)
