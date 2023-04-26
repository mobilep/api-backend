'use strict'

const daoScenario = require('./scenario.dao')
const daoPractice = require('./../practice/practice.dao')
const daoUser = require('../user/user.dao')
// const daoCompany = require('./../company/company.dao')
const helperScenario = require('./scenario.helper')
const helperUser = require('../user/user.helper')
const scenarioEventEmitter = require('./scenario.event').scenarioEventEmitter
const inboxEventEmitter = require('./../inbox/inbox.event').inboxEventEmitter
const intercomEmitter = require('../intercom/IntercomEmitter')
const admin = require('firebase-admin')
const firebase = admin.database()

const _config = require('./../../../config/config.js')

module.exports.create = (req, res, next) => {
  const result = helperScenario.validateCreate(req.body)
  if (result._users) {
    const index = result._users.indexOf(req.user._id.toString())
    if (index > -1) {
      result._users.splice(index, 1)
    }
  }
  result._company = req.company._id
  result._coach = req.user._id

  return daoScenario.create(JSON.parse(JSON.stringify(result))).then((scenario) => {
    if (scenario.type === 'current') {
      scenarioEventEmitter.emit('updateUserPractices', scenario)
      intercomEmitter.emit('scenario-sent', scenario)
    }
    scenario.chatId = _config.firebase.databaseURL + 'chats/' + scenario._coach._id + '/' + scenario._id.toString()
    return scenario.save()
  }).then(async (_scenario) => {
    if (_scenario.type === 'draft') {
      intercomEmitter.emit('scenario-draft-created', _scenario)
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
    const result = helperScenario.validateUpdate(req.body)
    const scenarioId = req.params.scenarioId
    if (result._users) {
      const index = result._users.indexOf(req.user._id.toString())
      if (index > -1) {
        result._users.splice(index, 1)
      }
    }
    const oldScenario = await daoScenario.getById(scenarioId)
    const _scenario = await daoScenario.update(scenarioId, result)
    if (oldScenario.type === 'draft' && _scenario.type !== 'draft') {
      intercomEmitter.emit('scenario-sent', _scenario)
    }
    if (_scenario.type !== 'draft') {
      let saveUser = false
      if (result.videoId && (oldScenario.videoId !== result.videoId)) {
        req.user.videosCount++
        saveUser = true
      }
      scenarioEventEmitter.emit('updateUserPractices', _scenario)
      if (result.examples) {
        result.examples.filter(example => !oldScenario.examples.some(oldExample => oldExample.videoId === example.videoId))
          .forEach((example, iterator) => {
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
  return daoScenario.delete(query).then(() => {
    res.sendStatus(204)
  }).catch((err) => {
    console.log('err', err)
    return next(err)
  })
}

module.exports.get = (req, res, next) => {
  const query = {
    reqUser: req.user._id
    // _company: req.company._id
  }
  return daoScenario.getJSON(query)
    .then((scenario) => {
      return scenario.map((scenario) => {
        const scenarioJSON = scenario
        scenarioJSON.userCriterias = [
          {
            _id: '590f7d5907e94106bdf393a5',
            name: 'Evaluate.Rate.Practice.Experience',
            _company: null
          },
          {
            _id: '591f7d5907e94106bdf393a5',
            name: 'Evaluate.Rate.Pertinent.To.Work',
            _company: null
          },
          {
            _id: '592f7d5907e94106bdf393a5',
            name: 'Evaluate.Rate.Recommend.To.Others',
            _company: null
          }
        ]
        if (scenarioJSON._id.toString() === '574e3a50616165b0b8b55111' || scenarioJSON._id.toString() === '574e3a50616165b0b8b55222') {
          scenarioJSON._users = [req.user.toJSON()]
        }
        return scenarioJSON
      })
    })
    .then((scenario) => {
      res.json(scenario)
    })
    .catch((err) => {
      console.log('err', err)
      return next(err)
    })
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

    if (result._practice) {
      practice = await daoPractice.getById(result._practice)
      inboxEventEmitter.emit('bestPracticeSavedNotification', practice)
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

    res.json(practicesData)
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
