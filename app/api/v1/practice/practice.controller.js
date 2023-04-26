'use strict'

const daoPractice = require('./practice.dao')
const helperPractice = require('./practice.helper')
const inboxEventEmitter = require('./../inbox/inbox.event').inboxEventEmitter
const practiceEventEmitter = require(
  './../practice/practice.event').practiceEventEmitter
const helperInbox = require('./../inbox/inbox.helper')
const _config = require('../../../config/config.js')
const json2csv = require('json2csv')
const intercomEmitter = require('../intercom/IntercomEmitter')

module.exports.get = (req, res, next) => {
  if (req.scenario.type === 'draft') {
    return res.json([])
  }
  const scenarioId = req.params.scenarioId
  daoPractice.get({
    _scenario: scenarioId,
    _user: req.user._id
  }).then((practices) => {
    res.json(practices)
  }).catch((err) => {
    console.log('err', err)
    return next(err)
  })
}
// TODO: organize sending evaluations
module.exports.edit = (req, res, next) => {
  const practiceId = req.params.practiceId
  const result = helperPractice.validateUpdate(req.body)
  daoPractice.getById(practiceId)
    .then((practice) => {
      let avgMark = 0
      if (!practice || !practice._coachInbox ||
        !practice._userInbox) {
        throw (utils.ErrorHelper.badRequest(
          'ERROR_INVALID_PRACTICE'))
      }
      let q = {}
      if (req.user._id.equals(practice._user._id) && result.userMark) {
        if (practice.userMark.length > 0) {
          throw utils.ErrorHelper.forbidden('ERROR_ACCESS_DENIED')
        }
        q = {userMark: result.userMark}
        q.coachEvaluatedAt = Date.now()
        // Send message
        result.userMark.forEach((val) => {
          avgMark += val.mark
        })
        avgMark = Math.round(avgMark / result.userMark.length * 10) / 10
        const evaluationMessageUser = {
          _user: practice._user._id,
          time: (new Date()).getTime(),
          content: {
            text: i18n.__({
              phrase: 'PRACTICE_EVALUATION_MESSAGE',
              locale: practice._user.lang
            }, practice._coach.firstName),
            avgMark: avgMark
          },
          type: 'evaluation'
        }
        const evaluationMessageCoach = {
          _user: practice._user._id,
          time: (new Date()).getTime(),
          content: {
            text: i18n.__({
              phrase: 'PRACTICE_EVALUATION_MESSAGE',
              locale: practice._coach.lang
            }, practice._coach.firstName),
            avgMark: avgMark
          },
          type: 'evaluation'
        }

        practice._userInbox.message = evaluationMessageUser
        inboxEventEmitter.emit('pushPracticeMessage', {
          inbox: practice._userInbox,
          pushNotification: false,
          practice: practice
        })
        practice._coachInbox.message = evaluationMessageCoach
        practice._coachInbox.status = 'unread'
        inboxEventEmitter.emit('pushPracticeMessage', {
          inbox: practice._coachInbox,
          pushNotification: false,
          practice: practice
        })

        intercomEmitter.emit('scenario-learner-evaluates', {practice, avgMark})
        practiceEventEmitter.emit('sendEvaluationPushNotification',
          practice._coach, practice._user, i18n.__(
            {phrase: 'PRACTICE_RATING_RECEIVED', locale: practice._coach.lang}),
          practice._id)
        if (practice._scenario._id.toString() === '574e3a50616165b0b8b55111' ||
          practice._scenario._id.toString() === '574e3a50616165b0b8b55222') {
          practiceEventEmitter.emit('demoScenarioEvaluated', practice)
        }
      } else if (req.user._id.equals(practice._coach._id) && result.coachMark) {
        if (practice.coachMark.length > 0) {
          throw utils.ErrorHelper.forbidden('ERROR_ACCESS_DENIED')
        }
        q = {coachMark: result.coachMark}

        // Send message
        result.coachMark.forEach((val) => {
          avgMark += val.mark
        })
        avgMark = Math.round(avgMark / result.coachMark.length * 10) / 10
        const evaluationMessageUser = {
          _user: practice._coach._id,
          time: (new Date()).getTime(),
          content: {
            text: i18n.__({
              phrase: 'PRACTICE_EVALUATION_MESSAGE',
              locale: practice._user.lang
            }, practice._user.firstName),
            avgMark: avgMark
          },
          type: 'evaluation'
        }
        const evaluationMessageCoach = {
          _user: practice._coach._id,
          time: (new Date()).getTime(),
          content: {
            text: i18n.__({
              phrase: 'PRACTICE_EVALUATION_MESSAGE',
              locale: practice._coach.lang
            }, practice._user.firstName),
            avgMark: avgMark
          },
          type: 'evaluation'
        }
        practice._coachInbox.message = evaluationMessageCoach
        // send once (inbox is the same for coach and user)
        inboxEventEmitter.emit('pushPracticeMessage', {
          inbox: practice._coachInbox,
          pushNotification: false,
          practice: practice
        })
        practice._userInbox.message = evaluationMessageUser
        practice._userInbox.status = 'unread'
        inboxEventEmitter.emit('pushPracticeMessage', {
          inbox: practice._userInbox,
          pushNotification: false,
          practice: practice
        })
        const evaluateMessageUser = {
          _user: practice._coach._id,
          time: (new Date()).getTime(),
          content: i18n.__(
            {phrase: 'PRACTICE_WHAT_YOU_THINK', locale: practice._user.lang}),
          type: 'evaluate'
        }
        const evaluateMessageCoach = {
          _user: practice._coach._id,
          time: (new Date()).getTime(),
          content: i18n.__(
            {phrase: 'PRACTICE_WHAT_YOU_THINK', locale: practice._coach.lang}),
          type: 'evaluate'
        }

        practice._coachInbox.message = evaluateMessageCoach
        // send once (inbox is the same for coach and user)
        inboxEventEmitter.emit('pushPracticeMessage', {
          inbox: practice._coachInbox,
          pushNotification: false,
          practice: practice
        })
        practice._userInbox.message = evaluateMessageUser
        practice._userInbox.status = 'unread'
        inboxEventEmitter.emit('pushPracticeMessage', {
          inbox: practice._userInbox,
          pushNotification: false,
          practice: practice
        })
        q.status = 'complete'
        q.userEvaluatedAt = Date.now()
        // TODO : duplicate inboxes
        intercomEmitter.emit('scenario-coach-evaluates-learner',
          {practice, avgMark})
        practiceEventEmitter.emit('sendEvaluationPushNotification',
          practice._user, practice._coach, i18n.__(
            {phrase: 'PRACTICE_RATING_RECEIVED', locale: practice._user.lang}),
          practice._id)
      } else {
        throw utils.ErrorHelper.forbidden('ERROR_ACCESS_DENIED')
      }
      return Promise.all([
        daoPractice.update(practiceId, q),
        practice._coachInbox.save(),
        practice._userInbox.save()])
    })
    .then((practice) => {
      practiceEventEmitter.emit('checkScenarioType', practice[0]._scenario)
      res.json(practice[0])
    })
    .catch((err) => {
      console.log('err', err)
      return next(err)
    })
}

module.exports.postMessage = (req, res, next) => {
  const result = helperInbox.validateInboxMessage(req.body)
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
      _config.aws.videoBucket + '/HLS/' + videoId + '/thumbs/00001.png'
    }
  }
  let inbox = null
  if (req.practice._coachInbox._id.equals(req.inbox._id)) {
    inbox = req.practice._userInbox
  }
  if (req.practice._userInbox._id.equals(req.inbox._id)) {
    inbox = req.practice._coachInbox
    req.practice.hasUserMessage = true
  }

  if (!inbox) return next(utils.ErrorHelper.badRequest('ERROR_INVALID_INBOX'))

  inbox.message = result
  inbox.status = 'unread'
  req.inbox.message = result
  let cb = () => null
  if ((req.practice._scenario._id.toString() === '574e3a50616165b0b8b55111' ||
      req.practice._scenario._id.toString() === '574e3a50616165b0b8b55222') && req.practice.userVideosCount === 0 && result.type === 'video'
  ) {
    cb = () => practiceEventEmitter.emit('demoScenarioReplay', req.practice)
  }

  inboxEventEmitter.emit('pushPracticeMessage',
    {inbox: inbox,
      pushNotification: true,
      practice: req.practice,
      cb: cb,
      content: result.content,
      canBeFirstMsg: false,
      canBeResponseMsg: true}) // recipient
  inboxEventEmitter.emit('pushPracticeMessage',
    {inbox: req.inbox,
      pushNotification: false,
      practice: req.practice,
      content: result.content,
      canBeFirstMsg: true,
      canBeResponseMsg: false}) // me
  // if ((req.practice._scenario._id.toString() === '574e3a50616165b0b8b55111' ||
  //     req.practice._scenario._id.toString() === '574e3a50616165b0b8b55222') && req.practice.userVideosCount === 0 && result.type === 'video'
  // ) {
  //   practiceEventEmitter.emit('demoScenarioReplay', req.practice)
  // }
  if (result.type === 'text') {
    req.user.messagesCount++
    if (req.practice._coachInbox._id.equals(req.inbox._id)) {
      req.practice.lastMessageFrom = 'coach'
      req.practice.coachMessagesCount++
    } else {
      req.practice.lastMessageFrom = 'learner'
      req.practice.userMessagesCount++
    }
  } else {
    if (req.practice._coachInbox._id.equals(req.inbox._id)) {
      req.practice.lastMessageFrom = 'coach'
      req.practice.coachVideosCount++
    } else {
      req.practice.lastMessageFrom = 'learner'
      req.practice.userVideosCount++
    }
  }
  req.user.save()
  req.practice.updatedAt = Date.now()

  return req.practice.save()
    .then(() => res.sendStatus(200))
    .catch((err) => next(err))
}

const json2csvPromise = (data) => {
  return new Promise((resolve, reject) => {
    json2csv({data}, (err, result) => {
      if (err) {
        console.log(err)
        reject(err)
      }
      resolve(result)
    })
  })
}

module.exports.export = async (req, res, next) => {
  try {
    let rawData = await daoPractice.export(req.params.companyId)
    let companyName = ''
    if (rawData.length !== 0) {
      companyName = rawData[0]['Company name']
      const csv = await json2csvPromise(rawData)
      res.writeHead(200, {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=${companyName} practice report.csv`
      })
      res.end(csv)
    } else {
      res.writeHead(200, {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=${companyName} practice report.csv`
      })
      res.end()
    }
  } catch (e) {
    next(e)
  }
}
