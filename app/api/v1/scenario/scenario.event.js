'use strict'

const EventEmitter = require('events')

class ScenarioEventEmitter extends EventEmitter {}

const scenarioEventEmitter = new ScenarioEventEmitter()

const daoPractice = require('../practice/practice.dao')
const practiceEventEmitter = require('../practice/practice.event').practiceEventEmitter

scenarioEventEmitter.on('updateUserPractices', (scenario) => {
  const users = scenario._users.map((user) => user._id)
  daoPractice.delete({
    _user: {$not: {$in: users}},
    _scenario: scenario._id
  }).then(() => {
    const practices = []
    scenario._users.forEach((user) => {
      practices.push(daoPractice.create({
        _scenario: scenario._id,
        _user: user,
        _coach: scenario._coach._id
      }))
    })
    return Promise.all(practices)
  })
    .then(() => {
      practiceEventEmitter.emit('checkScenarioType', scenario)
    })
})

module.exports.scenarioEventEmitter = scenarioEventEmitter
