'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema
/**
 * @apiDefine user User access only
 * This optional description belong to the group user.
 */
const team = new Schema({
  name: {
    type: String,
    trim: true,
    required: true
  },
  _users: [{type: Schema.Types.ObjectId, ref: 'User'}],
  _owner: {type: Schema.Types.ObjectId, ref: 'User'},
  _company: {type: Schema.Types.ObjectId, ref: 'Company'},
  isActive: {type: Boolean, default: true},
  isDefault: {type: Boolean, default: false, required: true}
}, {timestamps: true})

module.exports = mongoose.model('Team', team)
