'use strict'

const daoScenario = require('./scenario.dao')
const daoTeam = require('../team/team.dao')
const daoUser = require('../user/user.dao')
const helperScenario = require('./scenario.helper')
const templateEventEmitter = require('./../scenariotemplate/template.event').templateEventEmitter
const scenarioEventEmitter = require('./scenario.event').scenarioEventEmitter
const chatEventEmitter = require('../../../utils/mpchat/event').chatEventEmitter
const intercomEmitter = require('../intercom/IntercomEmitter')
const MPChat = require('../../../utils/mpchat/index')
const _config = require('../../../config/config.js')

module.exports.enrolUser = async (scenario, user) => {
  try {
    const scenarioId = scenario._id
    const scenarioChat = new MPChat()
    const oldType = scenario.type

    if (oldType === 'draft') {
      scenario.type = 'current'
    }

    helperScenario.validateTOMEnrolment(JSON.stringify(scenario))

    const oldScenario = await daoScenario.getById(scenarioId)
    const _scenario = await daoScenario.update(scenarioId, scenario)

    if (oldScenario.groupChat) {
      const groupChatId = oldScenario.groupChat.split('/').slice(-1)
      await scenarioChat.init(groupChatId[0])
      if (scenarioChat.chat) {
        await scenarioChat.addUser([user._id])
      }
    }

    if (oldType === 'draft') {
      const coach = await daoUser.getById(_scenario._coach)

      intercomEmitter.emit('scenario-sent', _scenario)
      const messageCoach = {
        _user: coach._id.toString(),
        content: i18n.__({
          phrase: 'CHAT_WELCOME_MESSAGE', locale: coach.lang
        }),
        type: 'welcome',
        time: (new Date()).getTime()
      }

      chatEventEmitter.emit('pushChatMessage', {message: messageCoach, currentUser: coach, chat: scenarioChat.chat})
    }
    if (_scenario.type !== 'draft') {
      scenarioEventEmitter.emit('updateUserPractices', _scenario)
    }
  } catch (e) {
    console.log('err', e)
    throw e
  }
}

module.exports.createDraftFromTemplate = async (data) => {
  try {
    const scenarioChat = new MPChat()
    const scenario = await createScenario(data, scenarioChat)
    await scenario.save()
    templateEventEmitter.emit('sendAssignmentPushNotification', scenario, scenario._coach)
  } catch (err) {
    console.log(err)
    throw err
  }
}

module.exports.assignScenarioToCoachTeam = async (data) => {
  try {
    const scenarioChat = new MPChat()
    const scenario = await createScenario(data, scenarioChat)

    const coachTeam = await daoTeam.getDefault({_owner: scenario._coach._id})
    scenario._users = daoScenario.removeOwnerFromTeamUsers(coachTeam._users, scenario._coach._id)

    const userIds = coachTeam._users.map(user => user._id)
    await scenarioChat.addUser(userIds)
    await scenario.save()

    const messageCoach = {
      _user: scenario._coach._id.toString(),
      content: i18n.__({
        phrase: 'CHAT_WELCOME_MESSAGE', locale: scenario._coach.lang
      }),
      type: 'welcome',
      time: (new Date()).getTime()
    }

    scenarioEventEmitter.emit('updateUserPractices', scenario)
    intercomEmitter.emit('scenario-sent', scenario)
    chatEventEmitter.emit('pushChatMessage', {message: messageCoach, currentUser: scenario._coach, chat: scenarioChat.chat})
    templateEventEmitter.emit('sendAssignmentPushNotification', scenario, scenario._coach)
  } catch (err) {
    console.log(err)
    throw err
  }
}

const createScenario = async (data, scenarioChat) => {
  try {
    const scenario = await daoScenario.create(data)
    const groupChat = await daoScenario.addGroupChat(scenarioChat, scenario._coach._id, scenario._id, [])

    scenario.groupChat = _config.firebase.databaseURL + 'mpchat/' + groupChat._id
    scenario.chatId = _config.firebase.databaseURL + 'chats/' + scenario._coach._id + '/' + scenario._id.toString()
    scenario.reminderIsVisible = await daoScenario.checkReminderVisibility(scenario._company, scenario, scenario._coach._id)
    return scenario
  } catch (err) {
    console.log(err)
    throw err
  }
}
