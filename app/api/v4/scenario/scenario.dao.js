'use strict'

const moment = require('moment')
const scenarioModel = require('../../../models/scenario.model')
const daoPractice = require('./../practice/practice.dao')
const daoCompany = require('./../company/company.dao')
const daoChat = require('../chat/chat.dao')

const _config = require('./../../../config/config.js')

module.exports.create = (data) => {
  return scenarioModel.create(data)
    .then((data) => {
      return scenarioModel.findOne({_id: data._id})
        .populate({
          path: '_users _coach',
          // model: 'User',
          match: {isActive: true},
          select: {
            _id: true,
            firstName: true,
            lastName: true,
            avatarId: true,
            avatarColor: true,
            devices: true,
            lang: true
          },
          options: {
            sort: {lastName: 1}
          }
        }).populate('_criterias')
    })
}

module.exports.getById = (id) => {
  return scenarioModel.findOne({_id: id, isActive: true})
    .populate({
      path: '_users _coach',
      // model: 'User',
      match: {isActive: true},
      select: {
        _id: true,
        firstName: true,
        lastName: true,
        avatarId: true,
        avatarColor: true,
        devices: true,
        lang: true
      },
      options: {
        sort: {lastName: 1}
      }
    }).populate('_criterias')
    .catch((err) => {
      throw utils.ErrorHelper.serverError(err)
    })
}

module.exports.getByIdSimple = (id) => {
  return scenarioModel.findOne({_id: id, isActive: true})
    .lean()
    .catch((err) => {
      throw utils.ErrorHelper.serverError(err)
    })
}

module.exports.getOne = (filter) => {
  return scenarioModel.findOne({...filter, isActive: true})
    .lean()
    .catch((err) => {
      throw utils.ErrorHelper.serverError(err)
    })
}

module.exports.getDemoScenario = (userId) => {
  return scenarioModel.findOne({_id: {$in: ['574e3a50616165b0b8b55111', '574e3a50616165b0b8b55222']}, isActive: true, _users: {$all: userId}})
    .populate({
      path: '_coach',
      // model: 'User',
      match: {isActive: true},
      select: {
        _id: true,
        firstName: true,
        lastName: true,
        avatarId: true,
        avatarColor: true,
        devices: true,
        lang: true
      }
    }).populate('_criterias')
    .catch((err) => {
      throw utils.ErrorHelper.serverError(err)
    })
}

module.exports.update = (id, data) => {
  return scenarioModel.findByIdAndUpdate(id, {$set: data}, {new: true})
    .populate({
      path: '_users _coach',
      // model: 'User',
      match: {isActive: true},
      select: {
        _id: true,
        firstName: true,
        lastName: true,
        avatarId: true,
        avatarColor: true,
        devices: true,
        lang: true
      },
      options: {
        sort: {lastName: 1}
      }
    }).populate('_criterias')
    .then((updated) => {
      return updated
    })
    .catch((err) => {
      throw utils.ErrorHelper.serverError(err)
    })
}

module.exports.pushBestPractice = (id, data) => {
  return scenarioModel.findByIdAndUpdate(id, {$push: {examples: data}},
    {new: true})
    .populate({
      path: '_users _coach',
      // model: 'User',
      match: {isActive: true},
      select: {
        _id: true,
        firstName: true,
        lastName: true,
        avatarId: true,
        avatarColor: true,
        devices: true,
        lang: true
      },
      options: {
        sort: {lastName: 1}
      }
    }).populate('_criterias')
    .then((updated) => {
      return updated
    })
    .catch((err) => {
      throw utils.ErrorHelper.serverError(err)
    })
}

module.exports.bulkDelete = (query) => {
  return scenarioModel.find(query).then((scenarios) => {
    if (scenarios.length === 0) {
      return
    }
    const promises = []
    scenarios.forEach((scenario) => {
      scenario.isActive = false
      promises.push(scenario.save())
      promises.push(daoPractice.delete({_scenario: scenario._id}))
    })
    return Promise.all(promises)
  }).catch((err) => {
    throw utils.ErrorHelper.serverError(err)
  })
}

module.exports.bulkDeleteReal = (query) => {
  return scenarioModel.remove(query)
}

module.exports.delete = (query, scenarioChat) => {
  return scenarioModel.findOne(query).then((scenario) => {
    if (!scenario) {
      return
    }
    scenario.isActive = false
    const promises = []
    promises.push(scenario.save())
    promises.push(deleteGroupChat(scenario, scenarioChat))
    promises.push(daoPractice.delete({_scenario: scenario._id}))

    return Promise.all(promises)
  }).catch((err) => {
    throw utils.ErrorHelper.serverError(err)
  })
}

module.exports.getScenariosWithDetails = async (query, user, companyId) => {
  const chatsWithScenarios = await daoChat.getChatsWithScenarios(query, user._id)
  const dto = chatsWithScenarios.map(chat => chat._id)

  const demo = await this.getDemoScenario(user._id)
  if (demo && !query._scenario) {
    dto.push({_scenario: demo.toJSON()})
  }

  const scenariosWithCriterias = dto.map((chat) => {
    const chatJSON = chat
    chatJSON._scenario.video = constructVideo(chatJSON._scenario)
    chatJSON._scenario._coach = constructAvatarUrls(chatJSON._scenario._coach)
    chatJSON._scenario._users.map(user => constructAvatarUrls(user))
    chatJSON._scenario.userCriterias = [
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

    if (chatJSON._scenario._id.toString() === '574e3a50616165b0b8b55111' || chatJSON._scenario._id.toString() === '574e3a50616165b0b8b55222') {
      chatJSON._scenario._users = [user.toJSON()]
      chatJSON._scenario.updatedAt = chatJSON._scenario.createdAt
    }
    return chatJSON
  })

  const companyInfo = await daoCompany.getById(companyId)
  const sendReminder = companyInfo.sendReminder ? companyInfo.sendReminder : 3

  const scenariosWithPractices = await this.getJSON(scenariosWithCriterias, user._id, sendReminder)
  return scenariosWithPractices
}

module.exports.getJSON = (chatsWithScenarios, user, sendReminder) => {
  const scenariosWithPractices = []
  chatsWithScenarios.forEach((chat) => {
    const scenario = chat._scenario
    if (!scenario._coach) return
    if (scenario._coach._id.equals(user)) {
      // user is coach
      let practices = daoPractice.get({
        _user: user,
        isActive: true,
        _scenario: scenario._id
      })
      scenariosWithPractices.push(
        Promise.all([scenario, practices])
      )
    } else {
      // user is learner
      let practice = daoPractice.getOne({
        isActive: true,
        _scenario: scenario._id,
        _user: user,
        _coach: scenario._coach._id
      })
      scenariosWithPractices.push(
        Promise.all([scenario, practice])
      )
    }
  })
  return Promise.all(scenariosWithPractices)
    .then((scenariosWithPractices) => {
      if (!scenariosWithPractices) {
        return []
      }
      const scenarios = []
      scenariosWithPractices.forEach((scenarioWithPractice) => {
        if (Array.isArray(scenarioWithPractice) &&
          !Array.isArray(scenarioWithPractice[1])) { // learner
          if (scenarioWithPractice[1]) {
            scenarioWithPractice[0].practiceStatus = {
              unreadPracticeChats: 0
            }
            if (scenarioWithPractice[1]._inbox.status === 'unread') {
              scenarioWithPractice[0].practiceStatus.unreadPracticeChats++
            }
            // scenarioWithPractice[0].type = scenarioWithPractice[1].status
            // scenario completed if practice has userMark
            if (scenarioWithPractice[1].userMark.length > 0) {
              scenarioWithPractice[0].type = scenarioWithPractice[1].status
            } else {
              scenarioWithPractice[0].type = 'current'
            }

            const d1 = new Date(scenarioWithPractice[0].updatedAt)
            const d2 = new Date(scenarioWithPractice[1].updatedAt)

            if (d1 < d2) {
              scenarioWithPractice[0].updatedAt = scenarioWithPractice[1].updatedAt
            }
            scenarios.push(scenarioWithPractice[0])
          }
        } else { // coach
          scenarioWithPractice[0].practiceStatus = {
            evaluated: 0,
            total: 0,
            unreadPracticeChats: 0
          }
          const practices = scenarioWithPractice[1]

          practices.forEach((practice) => {
            scenarioWithPractice[0].practiceStatus.total++
            if (practice.status === 'complete') {
              scenarioWithPractice[0].practiceStatus.evaluated++
            }
            if (practice._inbox.status === 'unread') {
              scenarioWithPractice[0].practiceStatus.unreadPracticeChats++
            }

            let d1 = new Date(scenarioWithPractice[0].updatedAt)
            let d2 = new Date(practice.updatedAt)

            if (d1 < d2) {
              scenarioWithPractice[0].updatedAt = practice.updatedAt
            }
          })
          if (scenarioWithPractice[0].dueDate && (scenarioWithPractice[0].reminderIsVisible === undefined ||
            scenarioWithPractice[0].reminderIsVisible) &&
            !scenarioWithPractice[0].isReminderSent) {
            const dueDate = moment(scenarioWithPractice[0].dueDate).utc()
            const dateNow = moment().utc()
            const daysDiff = dueDate.diff(dateNow, 'd')

            if (daysDiff >= 0 && daysDiff <= sendReminder) {
              scenarioWithPractice[0].reminderIsVisible = true
            } else {
              scenarioWithPractice[0].reminderIsVisible = false
            }
          }
          if (scenarioWithPractice[0].practiceStatus.total ===
            scenarioWithPractice[0].practiceStatus.evaluated || scenarioWithPractice[0].type === 'draft') {
            scenarioWithPractice[0].reminderIsVisible = false
          }
          scenarios.push(scenarioWithPractice[0])
        }
      })

      return scenarios
    })
    .catch((err) => {
      throw utils.ErrorHelper.serverError(err)
    })
}

module.exports.getByCompany = (id) => {
  return scenarioModel
    .find({_company: id})
}

module.exports.getIdsByCompany = (id) => {
  return scenarioModel.find({
    _company: id,
    _id: {$nin: ['574e3a50616165b0b8b55111', '574e3a50616165b0b8b55222']}
  }, '_id')
}

module.exports.addUserToDemoScenario = (scenarioId, userId) => {
  return scenarioModel.findByIdAndUpdate(
    scenarioId,
    {$push: {_users: userId}},
    {new: true}).catch((e) => {
    console.log(e)
  })
}

module.exports.getByCoachList = (coachList) => {
  return scenarioModel.find({_coach: {$in: coachList}, isActive: true, type: {$nin: ['draft']}}, '_coach _id name isActive type createdAt').lean()
    .populate({path: '_coach',
      match: {isActive: true},
      select: {
        _id: true,
        firstName: true,
        lastName: true,
        avatarId: true,
        avatarColor: true,
        devices: true,
        lang: true
      },
      options: {
        sort: {lastName: 1}
      }
    })
    .catch((e) => {
      console.log(e)
    })
}

module.exports.getAdminScenario = companyId => {
  return scenarioModel.find({_company: companyId, isActive: true, type: {$nin: ['draft']}}, '_coach _id name isActive type createdAt').lean()
    .populate({path: '_coach',
      match: {isActive: true},
      select: {
        _id: true,
        firstName: true,
        lastName: true,
        avatarId: true,
        avatarColor: true,
        devices: true,
        lang: true
      },
      options: {
        sort: {lastName: 1}
      }
    })
    .catch((e) => {
      console.log(e)
    })
}

module.exports.getAdminScenarioDetails = scenarioId => {
  return scenarioModel.findOne({_id: scenarioId})
    .populate('_company', 'name')
    .populate('_criterias')
    .populate({path: '_users _coach',
      match: {isActive: true},
      select: {
        _id: true,
        firstName: true,
        lastName: true,
        avatarId: true,
        avatarColor: true,
        devices: true,
        lang: true
      },
      options: {
        sort: {lastName: 1}
      }
    })
    .catch((e) => {
      console.log(e)
    })
}

module.exports.checkReminderVisibility = async (companyId, scenario, user) => {
  const companyInfo = await daoCompany.getById(companyId)
  const defaultSendReminderDays = 3
  const sendReminder = companyInfo.sendReminder ? companyInfo.sendReminder : defaultSendReminderDays
  let reminderIsVisible

  const practiceStatus = await this.checkPracticeStatus(user, scenario)

  if (scenario.dueDate) {
    const dueDate = moment(scenario.dueDate).utc()
    const dateNow = moment().utc()
    const daysDiff = dueDate.diff(dateNow, 'd')

    if (daysDiff >= 0 && daysDiff <= sendReminder) {
      reminderIsVisible = true
    }
  }
  if ((practiceStatus.total === practiceStatus.evaluated && practiceStatus.total !== 0) || scenario.type === 'draft') {
    reminderIsVisible = false
  }
  return reminderIsVisible
}

module.exports.removeCoachFromLearners = (users, coach) => {
  const usersWithoutCoach = users
  if (usersWithoutCoach) {
    const index = usersWithoutCoach.indexOf(coach.toString())
    if (index > -1) {
      usersWithoutCoach.splice(index, 1)
    }
  }
  return usersWithoutCoach
}

module.exports.removeOwnerFromTeamUsers = (users, coach) => {
  const usersWithoutCoach = users
  const userIds = users.map(user => user._id.toString())
  if (userIds) {
    const index = userIds.indexOf(coach.toString())
    if (index > -1) {
      usersWithoutCoach.splice(index, 1)
    }
  }
  return usersWithoutCoach
}

module.exports.addGroupChat = async (scenarioChat, coachId, scenarioId, learners) => {
  await scenarioChat.create({ type: 'practice', _moderator: coachId.toString(), _scenario: scenarioId.toString() })
  await scenarioChat.addUser([coachId, ...learners])
  return scenarioChat.chat
}

module.exports.checkPracticeStatus = async (user, scenario) => {
  const practiceStatus = {
    evaluated: 0,
    total: 0
  }
  const practices = await daoPractice.get({
    _user: user,
    isActive: true,
    _scenario: scenario._id
  })

  practices.forEach((practice) => {
    practiceStatus.total++
    if (practice.status === 'complete') {
      practiceStatus.evaluated++
    }
  })
  return practiceStatus
}

async function deleteGroupChat (scenario, scenarioChat) {
  const groupChatId = scenario.groupChat.split('/').slice(-1)
  await scenarioChat.init(groupChatId[0])
  scenarioChat.chat.isActive = false
  await scenarioChat.chat.save()
}

const constructAvatarUrls = (user) => {
  const result = user
  try {
    result.avatar_sm = result.avatarId
      ? ('https://s3-' + _config.aws.region + '.amazonaws.com/' +
        _config.aws.photoBucket + '/public/' + 100 + '/' + result.avatarId +
        '.jpg') : null
    result.avatar_md = result.avatarId
      ? ('https://s3-' + _config.aws.region + '.amazonaws.com/' +
        _config.aws.photoBucket + '/public/' + 640 + '/' + result.avatarId +
        '.jpg') : null
    result.avatar_lg = result.avatarId
      ? ('https://s3-' + _config.aws.region + '.amazonaws.com/' +
        _config.aws.photoBucket + '/public/' + 1024 + '/' + result.avatarId +
        '.jpg') : null
  } catch (e) {
    console.log('ERROR CONSTRUCT AVATAR', e)
  }
  return result
}

const constructVideo = (scenario) => {
  const result = scenario
  let video = {}
  const prefix = 'https://s3-' + _config.aws.region + '.amazonaws.com/' +
    _config.aws.videoBucket + '/HLS/' + result.videoId

  const prefixDash = 'https://s3-' + _config.aws.region + '.amazonaws.com/' +
    _config.aws.videoBucket + '/MPEG-DASH/' + result.videoId

  try {
    video = {
      videoId: result.videoId,
      duration: result.duration,
      size: result.size,
      videoOrientation: result.videoOrientation,
      playList: result.videoId ? prefix + '/playlist.m3u8' : null,
      dashList: result.videoId ? prefixDash + '/playlist.mpd' : null,
      thumb: result.videoId ? prefix + '/thumbs/00001.png' : null
    }
  } catch (e) {
    console.log('ERROR CONSTRUCT VIDEO', e)
  }
  return video
}
