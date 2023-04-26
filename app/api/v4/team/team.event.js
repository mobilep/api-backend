'use strict'

const EventEmitter = require('events')

class TeamEventEmitter extends EventEmitter {}

const teamEventEmitter = new TeamEventEmitter()

const daoTeam = require('./team.dao')

teamEventEmitter.on('deleteTeams', async (query) => {
  try {
    await daoTeam.deleteMany(query)
  } catch (err) {
    console.log(err)
  }
})

module.exports.teamEventEmitter = teamEventEmitter
