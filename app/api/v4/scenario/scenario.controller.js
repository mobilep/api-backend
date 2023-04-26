'use strict'

const daoScenario = require('./scenario.dao')
const daoPractice = require('./../practice/practice.dao')
const daoUser = require('../user/user.dao')
const helperInbox = require('../inbox/inbox.helper')
const helperScenario = require('./scenario.helper')
const helperUser = require('../user/user.helper')
const scenarioEventEmitter = require('./scenario.event').scenarioEventEmitter
const inboxEventEmitter = require('./../inbox/inbox.event').inboxEventEmitter
const chatEventEmitter = require('../../../utils/mpchat/event').chatEventEmitter
const intercomEmitter = require('../intercom/IntercomEmitter')
const admin = require('firebase-admin')
const moment = require('moment')
const mongoose = require('mongoose')
const firebase = admin.database()
const MPChat = require('../../../utils/mpchat/index')

const _config = require('./../../../config/config.js')

module.exports.create = (req, res, next) => {
  const defaultDueDate = moment.utc().hours(23).minutes(59).add(21, 'd')
  const minDueDate = moment.utc().hours(23).minutes(59).add(1, 'd')

  const result = helperScenario.validateCreate(req.body, defaultDueDate, minDueDate)
  result._users = daoScenario.removeCoachFromLearners(result._users, req.user._id)
  result._company = req.company._id
  result._coach = req.user._id

  const scenarioChat = new MPChat()
  return daoScenario.create(JSON.parse(JSON.stringify(result))).then(async (scenario) => {
    const groupChat = await daoScenario.addGroupChat(scenarioChat, req.user.id, scenario._id, result._users)

    scenario.groupChat = _config.firebase.databaseURL + 'mpchat/' + groupChat._id
    scenario.chatId = _config.firebase.databaseURL + 'chats/' + scenario._coach._id + '/' + scenario._id.toString()
    scenario.reminderIsVisible = await daoScenario.checkReminderVisibility(req.params.companyId, scenario, req.user._id)

    if (scenario.type === 'current') {
      scenarioEventEmitter.emit('updateUserPractices', scenario)
      intercomEmitter.emit('scenario-sent', scenario)

      const messageCoach = {
        _user: req.user._id.toString(),
        content: i18n.__({
          phrase: 'CHAT_WELCOME_MESSAGE', locale: req.user.lang
        }),
        type: 'welcome',
        time: (new Date()).getTime()
      }

      chatEventEmitter.emit('pushChatMessage', {message: messageCoach, currentUser: req.user, chat: scenarioChat.chat})
    }

    return scenario.save()
  }).then(async (_scenario) => {
    if (_scenario.type === 'draft') {
      intercomEmitter.emit('scenario-draft-created', _scenario)
      await scenarioChat.removeUser(result._users)
    } else {
      if (result.examples) {
        result.examples.forEach((example, iterator) => {
          // daoPractice.updateByFilter({_scenario, _user: req.user}, {hasBestPractice: true})
          intercomEmitter.emit('best-practice-selected', {
            name: example.name,
            _scenario,
            video: example,
            _user: req.user,
            time: new Date().setSeconds(new Date().getSeconds() + iterator * 2)
          })
          req.user.videosCount++
        })
        await req.user.save()
      }
    }
    res.json(_scenario)
  }).catch((err) => {
    console.log('err', err)
    return next(err)
  })
}

module.exports.edit = async (req, res, next) => {
  try {
    const defaultDueDate = moment.utc().hours(23).minutes(59).add(21, 'd')
    const result = helperScenario.validateUpdate(req.body, defaultDueDate)
    const scenarioId = req.params.scenarioId

    const oldScenario = await daoScenario.getById(scenarioId)
    result._users = daoScenario.removeCoachFromLearners(result._users, req.user._id)
    result._id = scenarioId
    result.reminderIsVisible = await daoScenario.checkReminderVisibility(req.params.companyId, result, req.user._id)

    const _scenario = await daoScenario.update(scenarioId, result)
    const scenarioUsers = oldScenario._users.map(u => u._id.toString())
    const usersToRemove = scenarioUsers.filter(x => !result._users.includes(x))

    const scenarioChat = new MPChat()
    if (oldScenario.groupChat) {
      const groupChatId = oldScenario.groupChat.split('/').slice(-1)
      await scenarioChat.init(groupChatId[0])
      if (scenarioChat.chat) {
        await scenarioChat.addUser(result._users)
        if (usersToRemove.length > 0) {
          await scenarioChat.removeUser(usersToRemove)
        }
      }
    }

    if (oldScenario.type === 'draft' && _scenario.type !== 'draft') {
      intercomEmitter.emit('scenario-sent', _scenario)
      const messageCoach = {
        _user: req.user._id.toString(),
        content: i18n.__({
          phrase: 'CHAT_WELCOME_MESSAGE', locale: req.user.lang
        }),
        type: 'welcome',
        time: (new Date()).getTime()
      }

      chatEventEmitter.emit('pushChatMessage', {message: messageCoach, currentUser: req.user, chat: scenarioChat.chat})
    }
    if (_scenario.type !== 'draft') {
      let saveUser = false
      if (result.videoId && (oldScenario.videoId !== result.videoId)) {
        req.user.videosCount++
        saveUser = true
      }
      scenarioEventEmitter.emit('updateUserPractices', _scenario)
      if (result.examples) {
        const newExamples = result.examples.filter(example => !oldScenario.examples.some(oldExample => oldExample.videoId === example.videoId))
        newExamples.forEach((example, iterator) => {
          // daoPractice.updateByFilter({_scenario, _user: req.user}, {hasBestPractice: true})
          intercomEmitter.emit('best-practice-selected', {
            name: example.name,
            _scenario,
            video: example,
            _user: req.user,
            time: new Date().setSeconds(new Date().getSeconds() + iterator * 2)
          })
          req.user.videosCount++
          saveUser = true
        })

        if (newExamples.length > 0) {
          chatEventEmitter.emit('bestPracticeAdded', _scenario._coach, scenarioChat)
        }
      }
      if (saveUser) {
        await req.user.save()
      }
    }
    res.json(_scenario)
  } catch (e) {
    console.log('err', e)
    return next(e)
  }
}

module.exports.delete = (req, res, next) => {
  const query = {_id: req.params.scenarioId}
  const scenarioChat = new MPChat()
  return daoScenario.delete(query, scenarioChat).then(() => {
    res.sendStatus(204)
  }).catch((err) => {
    console.log('err', err)
    return next(err)
  })
}

module.exports.get = async (req, res, next) => {
  const query = {
    users: { $elemMatch: { _user: req.user._id } },
    type: 'practice',
    isActive: true
  }

  try {
    const scenarios = await daoScenario.getScenariosWithDetails(query, req.user, req.params.companyId)
    res.json(scenarios)
  } catch (err) {
    console.log('err', err)
    next(err)
  }
}

module.exports.getScenarioDetails = async (req, res, next) => {
  const id = mongoose.Types.ObjectId(req.params.scenarioId)

  const query = {
    users: { $elemMatch: { _user: req.user._id } },
    type: 'practice',
    isActive: true,
    _scenario: id
  }

  try {
    const scenarios = await daoScenario.getScenariosWithDetails(query, req.user, req.params.companyId)
    if (!scenarios[0]) {
      throw utils.ErrorHelper.badRequest('ERROR_INVALID_SCENARIO')
    }
    res.json(scenarios[0])
  } catch (err) {
    console.log(err)
    next(err)
  }
}

module.exports.pushBestPractice = async (req, res, next) => {
  try {
    const result = helperScenario.validateBestPractice(req.body)
    const firebaseVideo = await firebase.ref(`videos/${result.videoId}`).once('value')
    if (firebaseVideo && firebaseVideo.val()) {
      result.size = firebaseVideo.val().size || 0
    }

    const scenarioId = req.params.scenarioId
    let video = false
    let practice
    req.scenario.examples.forEach((example) => {
      if (example.videoId === result.videoId) {
        video = true
      }
    })
    if (video) {
      return next(utils.ErrorHelper.badRequest('ERROR_BEST_PRACTICE_EXIST'))
    }

    const chatId = req.scenario.groupChat
      ? req.scenario.groupChat.split('/').slice(-1) : []
    const chat = new MPChat()
    await chat.init(chatId[0])

    if (result._practice) {
      practice = await daoPractice.getById(result._practice)
      inboxEventEmitter.emit('bestPracticeSavedNotification', practice)
      chatEventEmitter.emit('bestPracticeSaved', practice._user, practice._coach, chat)
    }

    const _scenario = await daoScenario.pushBestPractice(scenarioId, result)
    if (practice && practice._user) {
      await daoPractice.updateByFilter(practice._id, {hasBestPractice: true, lastMessageFrom: 'coach'})
    }
    intercomEmitter.emit('best-practice-selected', {
      name: result.name,
      _scenario,
      video: result,
      _user: practice ? practice._user : _scenario._coach
    })
    res.json(_scenario)
  } catch (err) {
    console.log('err', err)
    return next(err)
  }
}

module.exports.getAdminScenario = async (req, res, next) => {
  const user = req.user
  try {
    const requestData = helperScenario.validateAdminScenario(req.params)
    let companyScenarios

    if (req.isManager) {
      try {
        const criteria = helperUser.parseManagerCriteria(user.managerCriteria)
        const coachList = await daoUser.getByCriteria(criteria, requestData.companyId)
        companyScenarios = await daoScenario.getByCoachList(coachList)
      } catch (e) {
        companyScenarios = []
      }
    } else {
      companyScenarios = await daoScenario.getAdminScenario(requestData.companyId)
    }
    companyScenarios = await helperScenario.addPracticesToScenarios(companyScenarios)

    companyScenarios = helperScenario.filterAdminScenariosResponse(companyScenarios)
    res.json(companyScenarios)
  } catch (err) {
    console.log('err', err)
    return next(err)
  }
}

module.exports.countAdminScenario = async (req, res, next) => {
  let companyScenarios
  try {
    const criteria = helperUser.parseManagerCriteria(req.query.criteria)
    const coachList = await daoUser.getByCriteria(criteria, req.params.companyId)
    companyScenarios = await daoScenario.getByCoachList(coachList)
  } catch (e) {
    companyScenarios = []
  }
  res.json(companyScenarios.length)
}

module.exports.getAdminScenarioDetails = async (req, res, next) => {
  const user = req.user
  try {
    const requestData = helperScenario.validateAdminScenarioDetails(req.params)

    const scenarioData = helperScenario.filterAdminScenarioDetails(
      await daoScenario.getAdminScenarioDetails(requestData.scenarioId)
    )

    if (!scenarioData || String(scenarioData._company) !== requestData.companyId) {
      return next(utils.ErrorHelper.forbidden('ERROR_ACCESS_DENIED'))
    }

    if (req.isManager) {
      const criteria = helperUser.parseManagerCriteria(user.managerCriteria)
      const coachList = await daoUser.getByCriteria(criteria, requestData.companyId)
      const coachExists = coachList.findIndex((coach) => coach && String(coach._id) === String(scenarioData.coach._id)) >= 0
      if (!coachExists) {
        return next(utils.ErrorHelper.forbidden('ERROR_ACCESS_DENIED'))
      }
    }

    res.json(scenarioData)
  } catch (err) {
    console.log('err', err)
    return next(err)
  }
}

module.exports.getAdminScenarioLearnersVideos = async (req, res, next) => {
  const VIDEO_TYPE = 'video'
  const companyId = req.params.companyId
  const scenarioId = req.params.scenarioId
  const usersIds = req.query.userIds || []

  const resultJSON = []
  const scenario = await daoScenario.getOne({_id: scenarioId, _company: companyId})
  if (!scenario) {
    return next(utils.ErrorHelper.badRequest('ERROR_INVALID_SCENARIO'))
  }
  const practices = await daoPractice.getUsersPracticeByScenario(scenarioId, usersIds)
  console.log(1)
  for (const practice of practices) {
    const ref = firebase.ref(practice._userInbox.inboxId)
    const chat = (await ref.once('value')).val()
    const learnerId = practice._user._id
    const videos = []

    for (const chatItem of Object.values(chat)) {
      if (chatItem.type === VIDEO_TYPE && learnerId.toString() === chatItem._user.toString()) {
        const videoRef = firebase.ref(`videos/${chatItem.content.videoId}`)
        const videoDoc = (await videoRef.once('value')).val()

        if (videoDoc && videoDoc.ext) {
          videos.push({
            url: [
              `https://${_config.aws.videoBucket}.s3-${_config.aws.region}.amazonaws.com`,
              'uploads',
              `${videoDoc.videoId}.${videoDoc.ext}`
            ].join('/'),
            id: chatItem.content.videoId,
            creationTime: +chatItem.time
          })
        }
      }
    }

    videos.length && resultJSON.push({
      userName: `${practice._user.firstName} ${practice._user.lastName}`,
      videos: videos
    })
  }

  res.header('Content-Type', 'application/json')
  res.attachment('videos.json')

  return res.send(JSON.stringify(resultJSON))
}

module.exports.getAdminScenarioPractices = async (req, res, next) => {
  const user = req.user
  try {
    const requestData = helperScenario.validateAdminScenarioDetails(req.params)
    requestData.filter = helperScenario.getFilterParams(req.query)
    const scenarioData = await daoScenario.getByIdSimple(requestData.scenarioId)

    if (!scenarioData || String(scenarioData._company) !== requestData.companyId) {
      return next(utils.ErrorHelper.forbidden('ERROR_ACCESS_DENIED'))
    }
    if (req.isManager) {
      const criteria = helperUser.parseManagerCriteria(user.managerCriteria)
      const coachList = await daoUser.getByCriteria(criteria, requestData.companyId)
      const coachExists = coachList.findIndex((coach) => coach && String(coach._id) === String(scenarioData._coach)) >= 0
      if (!coachExists) {
        return next(utils.ErrorHelper.forbidden('ERROR_ACCESS_DENIED'))
      }
    }

    let practicesData = await helperScenario.filterAdminScenarioPractices(
      await daoPractice.getValidByScenarios(requestData.scenarioId)
    )

    if (requestData.filter) {
      practicesData = helperScenario.filterPractices(practicesData, requestData.filter)
    }

    const summary = {
      learners: practicesData.length,
      connections: 0,
      waitingOnLearner: 0,
      waitingOnCoach: 0,
      evaluated: 0
    }

    practicesData.forEach(practice => {
      if (practice.connection) {
        summary.connections++
      }
      if (practice.waitingOn === 'Learner') {
        summary.waitingOnLearner++
      }
      if (practice.waitingOn === 'Coach') {
        summary.waitingOnCoach++
      }
      if (practice.coachMark && practice.coachMark.length > 0) {
        summary.evaluated++
      }
    })

    const result = { summary, list: practicesData }

    res.json(result)
  } catch (err) {
    console.log('err', err)
    return next(err)
  }
}

module.exports.getPracticeMessages = async (req, res, next) => {
  const user = req.user
  try {
    const requestData = helperScenario.validateGetPracticeMessages(req.params)

    const practice = await daoPractice.getValidById(requestData.practiceId)
    if (!practice || !practice._coachInbox) {
      return next(utils.ErrorHelper.notFound('practice does not exist'))
    }

    if (String(practice._scenario._company) !== requestData.companyId) {
      return next(utils.ErrorHelper.forbidden('ERROR_ACCESS_DENIED'))
    }
    if (req.isManager) {
      const criteria = helperUser.parseManagerCriteria(user.managerCriteria)
      const coachList = await daoUser.getByCriteria(criteria, requestData.companyId)
      const coachExists = coachList.findIndex((coach) => coach && String(coach._id) === String(practice._scenario._coach)) >= 0
      if (!coachExists) {
        return next(utils.ErrorHelper.forbidden('ERROR_ACCESS_DENIED'))
      }
    }

    const responseData = helperScenario.pretifyMessages(
      await helperScenario.getMessageFromFirebase(practice._coachInbox.inboxId)
    )

    res.json(responseData)
  } catch (err) {
    console.log('err', err)
    return next(err)
  }
}

module.exports.sendReminder = async (req, res, next) => {
  const result = helperInbox.validateInboxMessage(req.body)

  try {
    const practices = await daoPractice.getCurrentByScenario(req.params.scenarioId)

    result._user = req.user._id
    result.time = (new Date()).getTime()
    if (!result.type) {
      result.type = 'text'
    }
    if (result.type === 'video') {
      const videoId = result.content.videoId
      const videoOrientation = result.content.videoOrientation || 'portrait'
      const duration = result.content.duration || 0
      const size = result.content.size || 0
      const text = result.content.text || ''
      result.content = {
        videoId: videoId,
        duration: duration,
        size: size,
        videoOrientation: videoOrientation,
        playList: 'https://s3-' + _config.aws.region + '.amazonaws.com/' +
          _config.aws.videoBucket + '/HLS/' + videoId + '/playlist.m3u8',
        dashList: 'https://s3-' + _config.aws.region + '.amazonaws.com/' +
          _config.aws.videoBucket + '/MPEG-DASH/' + videoId + '/playlist.mpd',
        thumb: 'https://s3-' + _config.aws.region + '.amazonaws.com/' +
          _config.aws.videoBucket + '/HLS/' + videoId + '/thumbs/00001.png',
        text
      }
    }
    if (result.type === 'file') {
      const fileId = result.content.fileId
      const originalName = result.content.originalName
      const name = result.content.fileName
      const size = result.content.size || 0
      const text = result.content.text || ''
      result.content = {
        fileId,
        fileName: name,
        originalName,
        size,
        link: 'https://s3-' + _config.aws.region + '.amazonaws.com/' +
          _config.aws.fileBucket + '/files/' + name,
        text
      }
    }
    if (result.type === 'image') {
      const imageId = result.content.imageId
      const name = result.content.imageName
      const text = result.content.text || ''
      result.content = {
        imageId,
        imageName: name,
        link: 'https://s3-' + _config.aws.region + '.amazonaws.com/' +
          _config.aws.inboxPhotoBucket + '/public/images/' + name,
        text
      }
    }
    if (result.type === 'audio') {
      const audioId = result.content.audioId
      const size = result.content.size || 0
      const text = result.content.text || ''
      result.content = {
        audioId,
        size,
        link: 'https://s3-' + _config.aws.region + '.amazonaws.com/' +
        _config.aws.audioBucket + '/mp3/' + audioId + '/output/320k.mp3',
        text
      }
    }

    practices.forEach(practice => {
      practice._userInbox.message = result
      practice._userInbox.status = 'unread'
      practice._userInbox.unreadMessagesCount = practice._userInbox.unreadMessagesCount !== undefined
        ? practice._userInbox.unreadMessagesCount + 1 : 1
      inboxEventEmitter.emit('pushPracticeMessage', {
        inbox: practice._userInbox,
        pushNotification: true,
        practice
      })

      practice._coachInbox.message = result
      practice._coachInbox.status = 'unread'
      inboxEventEmitter.emit('pushPracticeMessage', {
        inbox: practice._coachInbox,
        pushNotification: false,
        practice
      })

      practice.lastMessageFrom = 'coach'
      if (result.type === 'text') {
        req.user.messagesCount++
        practice.coachMessagesCount++
      }
      if (result.type === 'video') {
        practice.coachVideosCount++
      }
      if (result.type === 'file') {
        practice.coachFilesCount++
      }
      if (result.type === 'image') {
        practice.coachPhotosCount++
      }
      if (result.type === 'audio') {
        practice.coachAudiosCount++
      }

      practice.updatedAt = Date.now()
      practice.save()
    })

    const scenario = req.scenario
    scenario.isReminderSent = true
    scenario.reminderIsVisible = false
    await scenario.save()

    const chatId = scenario.groupChat
      ? scenario.groupChat.split('/').slice(-1) : []
    const chat = new MPChat()
    await chat.init(chatId[0])
    const practiceStatus = await daoPractice.getPracticeStatus(scenario._id)

    chatEventEmitter.emit('reminderSent', scenario, req.user, practiceStatus, chat)

    res.sendStatus(204)
  } catch (err) {
    console.log('err', err)
    return next(err)
  }
}

module.exports.editScenarioReminder = async (req, res, next) => {
  try {
    const result = helperScenario.validateUpdateReminder(req.body)
    const scenario = req.scenario
    scenario.reminderIsVisible = result.reminderIsVisible
    await scenario.save()

    res.json(scenario)
  } catch (err) {
    console.log('err', err)
    return next(err)
  }
}
