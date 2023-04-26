'use strict'

const _config = require('../../../config/config.js')

const modelScenario = require('../../../models/scenario.model')
const modelMPChat = require('../../../models/mpchat.model')
const modelTeam = require('../../../models/team.model')
const MPChat = require('../../../utils/mpchat/index')
const chatEventEmitter = require('../../../utils/mpchat/event').chatEventEmitter

/* add chats to old scenarios */

module.exports.addChats = async () => {
  const scenarios = await modelScenario.find({ groupChat: { $exists: false }, isActive: true })
    .populate('_coach')

  const promises = []
  scenarios.forEach(scenario => {
    // exclude demo scenarios and incorrect scenarios
    if (scenario._id.toString() !== '574e3a50616165b0b8b55111' &&
      scenario._id.toString() !== '574e3a50616165b0b8b55222' &&
      scenario._coach instanceof Object) {
      promises.push(createChat(scenario))
    }
  })
  return Promise.all(promises)
}

const createChat = async (scenario) => {
  const scenarioChat = new MPChat()
  await scenarioChat.create({ type: 'practice', _moderator: scenario._coach._id.toString(), _scenario: scenario._id.toString() })
  await scenarioChat.addUser([scenario._coach._id, ...scenario._users])
  scenario.groupChat = _config.firebase.databaseURL + 'mpchat/' + scenarioChat.chat._id

  const messageCoach = {
    _user: scenario._coach._id.toString(),
    content: i18n.__({
      phrase: 'CHAT_WELCOME_MESSAGE', locale: scenario._coach.lang
    }),
    type: 'welcome',
    time: (new Date()).getTime()
  }

  chatEventEmitter.emit('pushChatMessage', { message: messageCoach, currentUser: scenario._coach, chat: scenarioChat.chat })

  await scenario.save()
  return scenarioChat
}

module.exports.deleteChats = async () => {
  const chats = await modelMPChat.find({isActive: true, type: 'practice'}).populate('_scenario')
  const promises = []

  chats.forEach(chat => {
    if (chat._scenario && !chat._scenario.isActive && chat.isActive) {
      promises.push(modelMPChat.findByIdAndUpdate(chat._id, {isActive: false}))
    }
  })

  return Promise.all(promises)
}

module.exports.addTeamProperty = async () => {
  const teams = await modelTeam.find({isActive: true, isDefault: {$exists: false}})

  const defaultTeams = []
  const notDefaultTeams = []
  const error = []
  const promises = []

  teams.forEach(team => {
    const usersIds = team._users.map(user => user.toString())
    if (team._owner) {
      if (usersIds.includes(team._owner.toString())) {
        team.isDefault = true
        promises.push(team.save())
        defaultTeams.push(team)
      } else {
        team.isDefault = false
        promises.push(team.save())
        notDefaultTeams.push(team)
      }
    } else {
      error.push(team)
    }
  })

  await Promise.all(promises)
  return {
    defaultTeams, notDefaultTeams, error
  }
}
