'use strict'

const practiceModel = require('../../../models/practice.model')
const inboxModel = require('../../../models/inbox.model')
const practiceEventEmitter = require('./practice.event').practiceEventEmitter
const daoScenario = require('./../scenario/scenario.dao')
const daoInbox = require('./../inbox/inbox.dao')
const intercomEmitter = require('../intercom/IntercomEmitter')

module.exports.create = async (data) => {
  // TODO : refactor this
  try {
    let scenario = await daoScenario.getById(data._scenario)
    scenario = scenario.toJSON()
    const msgTime = (new Date()).getTime()
    let messageUser = {
      _user: data._coach,
      content: i18n.__(
        {phrase: 'PRACTICE_WELCOME_MESSAGE', locale: data._user.lang},
        scenario.name),
      type: 'welcome',
      time: msgTime
    }
    let messageCoach = {
      _user: data._coach,
      content: i18n.__(
        {phrase: 'PRACTICE_WELCOME_MESSAGE', locale: scenario._coach.lang},
        scenario.name),
      type: 'welcome',
      time: msgTime
    }

    const existPractice = await practiceModel.findOne({
      _scenario: data._scenario,
      _user: data._user._id,
      _coach: data._coach,
      isActive: true
    })

    if (existPractice) {
      return existPractice
    }

    //
    let userInbox = await inboxModel.create({
      _user: data._user._id,
      _recipient: data._coach,
      type: 'practice',
      status: 'unread', // message.type === 'video' ? 'unread' : 'read',
      message: messageUser
    })

    userInbox = await daoInbox.getById(userInbox._id)

    let coachInbox = await inboxModel.create({
      _user: data._coach,
      _recipient: data._user._id,
      type: 'practice',
      status: 'read',
      message: messageCoach
    })

    coachInbox = await daoInbox.getById(coachInbox._id)

    let practice = await practiceModel.findOneAndUpdate({
      _scenario: data._scenario,
      _user: data._user._id,
      _coach: data._coach,
      isActive: true
    }, {
      _scenario: data._scenario,
      _user: data._user._id,
      _coach: data._coach,
      _userInbox: userInbox._id,
      _coachInbox: coachInbox._id,
      isActive: true
    }, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    })
    coachInbox.inboxId = 'chats/' + coachInbox._user._id + '/' + data._scenario + '/' + practice.id + '/' + coachInbox._id.toString()
    userInbox.inboxId = 'chats/' + userInbox._user._id + '/' + data._scenario + '/' + practice.id + '/' + userInbox._id.toString()
    const newMessages = scenario.videoId ? 2 : 1
    userInbox.unreadMessagesCount = userInbox.unreadMessagesCount !== undefined
      ? userInbox.unreadMessagesCount + newMessages : newMessages
    await coachInbox.save()
    await userInbox.save()
    practice = await this.getById(practice._id)
    practiceEventEmitter.emit('createChat', {
      inbox: coachInbox,
      pushNotification: false,
      scenario: scenario,
      practice: practice
    })
    practiceEventEmitter.emit('createChat', {
      inbox: userInbox,
      pushNotification: true,
      scenario: scenario,
      practice: practice
    })

    // practiceEventEmitter.emit('createChat', {inboxId: coachInbox.inboxId, _coach: practice._coach})
    // practiceEventEmitter.emit('createChat', {inboxId: userInbox.inboxId, _coach: practice._coach})
    // TODO: use locale variable
    // practiceEventEmitter.emit('sendPushNotification', data._user, 'You have bean added to new practice', practice._id) // TODO: use localization

    return practice
      .save()
      .then((practice) => {
        // utils.Mail.sendAssignEmail(practice) // MPM-499
        return practice
      })
      .then(res => practiceModel.populate(res, '_coach _scenario'))
      .then(res => intercomEmitter.emit('user-assigned-to-practice', res))
      .catch((e) => console.log(e))
  } catch (e) {
    console.log(e)
  }
}

module.exports.update = (id, data) => {
  return practiceModel.findByIdAndUpdate(id, {$set: data}, {new: true})
    .then((updated) => {
      return this.getById(updated._id)
    })
    .catch((err) => {
      throw utils.ErrorHelper.serverError(err)
    })
}

module.exports.updateByFilter = (filter, data) => {
  return practiceModel.findByIdAndUpdate(filter, {$set: data}, {new: true})
    .then((updated) => {
      return this.getById(updated._id)
    })
    .catch((err) => {
      throw utils.ErrorHelper.serverError(err)
    })
}

module.exports.delete = (query) => {
  return practiceModel.find(query).populate({
    path: '_userInbox _coachInbox _user _coach'
  }).then((practices) => {
    practices.forEach((practice) => {
      practice._userInbox.isActive = false
      practice._userInbox.save()
      practice._coachInbox.isActive = false
      practice._coachInbox.save()
      practice.isActive = false
      // practice._user.messagesCount -= practice.userMessagesCount
      // practice._user.videosCount -= practice.userVideosCount
      // practice._coach.messagesCount -= practice.coachMessagesCount
      // practice._coach.videosCount -= practice.coachVideosCount
      practice._user.save()
      practice._coach.save()
      practice.save()
    })
  })
}

module.exports.deleteReal = (query) => {
  return practiceModel.find(query).populate({
    path: '_userInbox _coachInbox _user _coach'
  }).then((practices) => {
    practices.forEach((practice) => {
      // practice._userInbox.isActive = false
      // practice._userInbox.save()
      // practice._coachInbox.isActive = false
      // practice._coachInbox.save()
      practice.isActive = false
      // practice._user.messagesCount -= practice.userMessagesCount
      // practice._user.videosCount -= practice.userVideosCount
      // practice._coach.messagesCount -= practice.coachMessagesCount
      // practice._coach.videosCount -= practice.coachVideosCount
      // practice._user.save()
      practice._coach.save()
      practice.save()
    })
  })
}
// scenarioModel.find({isActive: false}).then((scenarios) => {
//   const ids = []
//   scenarios.forEach((s) => {
//     ids.push(s._id)
//   })
//   practiceModel.find({
//     $or: [
//       {isActive: false},
//       {_scenario: {$in: ids}}
//     ]
//   })
// .populate({
//     path: '_userInbox _coachInbox'
//   }).then((practices) => {
//     practices.forEach((practice) => {
//       practice._userInbox.isActive = false
//       practice._userInbox.save()
//       practice._coachInbox.isActive = false
//       practice._coachInbox.save()
//       //practice.isActive = false
//       //practice.save()
//     })
//   })
// })
module.exports.findById = (id) => {
  return practiceModel.findOne({_id: id})
}

module.exports.getById = (id) => {
  return practiceModel.findOne({_id: id, isActive: true})
    .populate('_scenario', {
      _id: true,
      name: true,
      _criterias: true,
      dueDate: true,
      groupChat: true,
      isPracticed: true
    })
    .populate({
      path: '_user _coach',
      // model: 'User',
      match: {isActive: true},
      select: {
        _id: true,
        firstName: true,
        lastName: true,
        avatarId: true,
        avatarColor: true,
        devices: true,
        email: true,
        lang: true,
        messagesCount: true,
        videosCount: true
      }
    })
    .populate({
      path: '_userInbox _coachInbox',
      // model: 'Inbox',
      populate: {
        path: '_user _recipient',
        match: {isActive: true},
        select: {
          _id: true,
          firstName: true,
          lastName: true,
          avatarId: true,
          avatarColor: true,
          devices: true,
          lang: true,
          messagesCount: true,
          videosCount: true
        }
      }
    })
    .populate('coachMark._criteria userMark._criteria')
    .catch((err) => {
      throw utils.ErrorHelper.serverError(err)
    })
}

module.exports.get = (options) => {
  const q = {}

  if (options._user) {
    q['$or'] = [{_user: options._user}, {_coach: options._user}]
  }

  if (options._scenario) {
    q._scenario = options._scenario
  }
  if (options._id) {
    q._id = options._id
  }

  if (options.status) {
    q.status = options.status
  }

  if (options._userInbox) {
    q._userInbox = options._userInbox
  }

  q.isActive = true

  return practiceModel.find(q)
    .populate('_scenario', {
      _id: true,
      name: true,
      isActive: true,
      groupChat: true,
      isPracticed: true
    })
    .populate({
      path: '_user _coach',
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
    })
    .populate('_userInbox _coachInbox')
    .populate('coachMark._criteria userMark._criteria')
    .then((practices) => {
      return practices.map((practice) => {
        practice = practice.toJSON()
        if (!practice._scenario.isActive || !practice._user ||
          !practice._coach) {
          return null
        }
        if (practice._user._id.equals(options._user)) {
          practice._inbox = practice._userInbox
        }
        if (practice._coach._id.equals(options._user)) {
          practice._inbox = practice._coachInbox
        }
        delete practice._userInbox
        delete practice._coachInbox
        return practice
      })
    })
    .then((practices) => {
      const result = []
      practices.forEach((practice) => {
        if (practice) result.push(practice)
      })
      return result
    })
    .catch((err) => {
      throw utils.ErrorHelper.serverError(err)
    })
}

module.exports.getV2 = async (options) => {
  const q = {}

  if (options._user) {
    q['$or'] = [{_user: options._user}, {_coach: options._user}]
  }

  if (options._scenario) {
    q._scenario = options._scenario
  }
  if (options._id) {
    q._id = options._id
  }

  if (options.status) {
    q.status = options.status
  }

  q.isActive = true

  try {
    console.log('q', q)
    const hrstart = process.hrtime()
    const practices = await practiceModel.find(q).lean()
      .populate({
        path: '_scenario',
        match: {isActive: true},
        select: {
          _id: true,
          name: true,
          isActive: true
        }
      })
      .populate({
        path: '_user _coach',
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
      })
      .populate('_userInbox _coachInbox coachMark._criteria userMark._criteria')
    const hrend = process.hrtime(hrstart)
    console.info('Execution query time (hr): %ds %dms', hrend[0], hrend[1] / 1000000)
    console.log('TOTAL', practices.length)

    return practices.map((practice) => {
      // practice = practice.toJSON()
      if (!practice._scenario || !practice._user || !practice._coach) {
        return null
      }
      if (practice._user._id.equals(options._user)) {
        practice._inbox = practice._userInbox
      }
      if (practice._coach._id.equals(options._user)) {
        practice._inbox = practice._coachInbox
      }
      delete practice._userInbox
      delete practice._coachInbox
      return practice
    })
  } catch (error) {
    throw utils.ErrorHelper.serverError(error)
  }
}

module.exports.getOne = (options) => {
  const q = {}

  if (options._user) {
    q['$or'] = [{_user: options._user}, {_coach: options._user}]
  }

  if (options._scenario) {
    q._scenario = options._scenario
  }
  if (options._id) {
    q._id = options._id
  }

  q.isActive = true

  return practiceModel.findOne(q)
    .populate('_scenario', {
      _id: true,
      name: true
    })
    .populate({
      path: '_user _coach',
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
    }).populate('_userInbox _coachInbox')
    .populate('coachMark._criteria userMark._criteria')
    .then((practice) => {
      if (!practice) return null
      practice = practice.toJSON()
      if (practice._user._id.equals(options._user)) {
        practice._inbox = practice._userInbox
      }
      if (practice._coach._id.equals(options._user)) {
        practice._inbox = practice._coachInbox
      }
      delete practice._userInbox
      delete practice._coachInbox
      return practice
    })
    .catch((err) => {
      throw utils.ErrorHelper.serverError(err)
    })
}

module.exports.getMyPractices = (options) => {
  const q = {}

  q.isActive = true

  if (options._user) {
    q._user = options._user
  }

  if (options._coach) {
    q._coach = options._coach
  }

  return practiceModel.find(q)
    .populate({
      path: '_user _coach',
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
    })
    .populate('coachMark._criteria userMark._criteria')
    .populate('_scenario', {isActive: true})
    .then((practices) => {
      return practices.filter((val) => {
        return val._scenario.isActive
      })
    })
    .catch((err) => {
      throw utils.ErrorHelper.serverError(err)
    })
}

module.exports.getMyScenarios = (options) => {
  const q = {}

  q.isActive = true

  if (options._coach) {
    q._coach = options._coach
  }

  return practiceModel.aggregate([
    {$match: q},
    {
      $group: {
        _id: '$_scenario',
        practices: {
          $push: '$$ROOT'
        }
      }
    },
    {
      $lookup: {
        'from': 'scenarios',
        'localField': '_id',
        'foreignField': '_id',
        'as': '_scenario'
      }
    },
    {
      $unwind: '$_scenario'
    },
    {
      $match: {
        '_scenario.isActive': true
      }
    }
  ])
    .then((scenarios) => {
      return scenarios
    }).catch((err) => {
      throw utils.ErrorHelper.serverError(err)
    })
}

const exportRow = (practiceRow) => {
  const {
    _user: userData,
    _scenario: scenarioData,
    _coach: coachData,
    coachMark: criteriaData,
    _userInbox: userInbox,
    _coachInbox: coachInbox
  } = practiceRow

  const criterias = scenarioData._criterias
  if (userData && userData.extraInformation) {
    userData.extraInformation.forEach(e => {
      userData[e.title] = e.description
    })
  }

  const columnsBefore = {
    'Participant Name': userData ? (userData.firstName + ' ' +
      userData.lastName) : null,
    'Email': userData ? userData.email : null,
    'Company name': userData ? userData._company.name : null,
    'Business Unit': userData['Business Unit'] ? userData['Business Unit'] : null,
    'Firs time log in': userData.firstLogIn,
    'Time between user created and first log in': userData.firstLogIn && userData.createdAt ? Math.floor(Math.abs((new Date(userData.firstLogIn).getTime()) - (new Date(userData.createdAt).getTime())) / 1000) : null,
    'Learner first message': userInbox.firstMessageAt,
    'Coach first message': coachInbox.firstMessageAt,
    'Time between learner first message and coach response': userInbox.firstMessageAt && userInbox.firstResponseAt ? Math.floor(Math.abs((new Date(userInbox.firstResponseAt).getTime()) - (new Date(userInbox.firstMessageAt).getTime())) / 1000) : null,
    'Learner evaluated': practiceRow.userEvaluatedAt,
    'Coach evaluated': practiceRow.coachEvaluatedAt,
    'User video selected for Best practice': practiceRow.hasBestPractice,
    'Learner has created a response but has not been evaluated yet': (practiceRow.hasUserMessage) && practiceRow.coachMark.length < 1,
    'Average scenario mark': practiceRow.averageMark,
    'Total scenario mark': practiceRow.totalMark,
    'Post Code': userData ? userData.postcode : null,
    'Region': userData['Region'] ? userData['Region'] : null,
    'Country Region': userData['Country Region'] ? userData['Country Region'] : null,
    'Country': userData ? userData.country : null,
    'Global Region': userData['Global Region'] ? userData['Global Region'] : null,
    'Custom 1': userData['Custom 1'] ? userData['Custom 1'] : null,
    'Custom 2': userData['Custom 2'] ? userData['Custom 2'] : null,
    'Custom 3': userData['Custom 3'] ? userData['Custom 3'] : null
  }

  const columnsAfter = {
    'Scenario id': userData ? scenarioData._id : null,
    'Scenario Name': scenarioData.name,
    'Scenario Description': scenarioData.info,
    'Scenario created': scenarioData.createdAt,
    'Coach id': coachData ? coachData._id : null,
    'Coach Name': coachData
      ? (coachData.firstName + ' ' + coachData.lastName)
      : null
  }

  if (criteriaData && criteriaData.length > 0) {
    criteriaData.forEach((criteria, index) => {
      let criteriaName = criteria._criteria ? criteria._criteria.name : 'null'
      columnsAfter['Coach Criteria ' + (index + 1)] = criteriaName
      columnsAfter['Competency equivalent ' + (index + 1)] = criteria.mark
    })
  } else if (criterias) {
    criterias.forEach((criteria, index) => {
      columnsAfter['Coach Criteria ' + (index + 1)] = criteria.name
      columnsAfter['Competency equivalent ' + (index + 1)] = ''
    })
  }
  return Object.assign(columnsBefore, columnsAfter)
}

module.exports.export = async (id) => {
  try {
    const companyScenarios = await daoScenario.getIdsByCompany(id)
    const ids = companyScenarios.map(item => item._id)

    let practices = await practiceModel
      .find({
        _scenario: {
          $in: ids
        }
      })
      .populate({
        path: '_user',
        select: {
          _id: true,
          firstName: true,
          lastName: true,
          country: true,
          email: true,
          _company: true,
          extraInformation: true,
          firstLogIn: true,
          createdAt: true,
          postcode: true
        },
        populate: {
          path: '_company'
        }
      })
      .populate('_coach', {
        _id: true,
        firstName: true,
        lastName: true
      })
      .populate({
        path: '_scenario',
        select: {
          _id: true,
          name: true,
          info: true,
          createdAt: true,
          _criterias: true
        },
        populate: {
          path: '_criterias'
        }
      })
      .populate('_userInbox', {
        _id: true,
        firstMessageAt: true,
        firstResponseAt: true,
        message: true
      })
      .populate('_coachInbox', {
        _id: true,
        firstMessageAt: true,
        firstResponseAt: true,
        message: true
      })
      .populate('coachMark._criteria')
    const readyPractices = practices.filter(e => {
      if (e._user && e._user._company) {
        return JSON.stringify(e._user._company._id) === JSON.stringify(id)
      }
    })
    /*
    const marks = readyPractices.map(prac => prac.coachMark.length ? {
      totalMarks: prac.coachMark.map(markOb => markOb.mark).reduce((acum, now) => acum + now),
      marksCount: prac.coachMark.length
    } : null).filter(m => m != null)
    const averageMark = marks.length ? marks.map(m => m.totalMarks / m.marksCount).reduce((acum, now) => acum + now) / marks.length : null
    const totalMark = marks.length ? marks.map(m => m.totalMarks).reduce((acum, now) => acum + now) : null
    */
    const getAvgAndTotalMarkOfScenario = (scenarioId) => {
      const readyScenarioPractices = practices.filter(e => e._scenario._id.equals(scenarioId))
      const marks = readyScenarioPractices.map(prac => prac.coachMark.length ? {
        totalMarks: prac.coachMark.map(markOb => markOb.mark).reduce((acum, now) => acum + now),
        marksCount: prac.coachMark.length
      } : null).filter(m => m != null)
      const averageMark = marks.length ? marks.map(m => m.totalMarks / m.marksCount).reduce((acum, now) => acum + now) / marks.length : null
      const totalMark = marks.length ? marks.map(m => m.totalMarks / m.marksCount).reduce((acum, now) => acum + now) : null
      return {
        averageMark: averageMark,
        totalMark: totalMark
      }
    }
    readyPractices.forEach(prac => {
      const avg = getAvgAndTotalMarkOfScenario(prac._scenario._id)
      prac.averageMark = avg.averageMark
      prac.totalMark = avg.totalMark
    })
    return readyPractices.map(exportRow)
  } catch (err) {
    throw utils.ErrorHelper.serverError(err)
  }
}

module.exports.getByScenario = async (id) => {
  try {
    return practiceModel.find({_scenario: id})
  } catch (err) {
    throw utils.ErrorHelper.serverError(err)
  }
}

module.exports.getByScenarios = async (ids) => {
  try {
    const match = {_scenario: {$in: ids}, isActive: true}
    const groupBy = {
      _id: '$_scenario',
      practices: {$addToSet: '$$ROOT'}

    }
    return practiceModel

      .aggregate([
        {$match: match},
        {$group: groupBy}
      ])
  } catch (err) {
    throw utils.ErrorHelper.serverError(err)
  }
}

module.exports.getValidByScenarios = async id => {
  try {
    return practiceModel.find({
      _scenario: id,
      isActive: true
    }).populate('_user', 'firstName lastName avatarColor avatar_sm avatar_md avatar_lg avatarId')
      .populate('_coachInbox', 'inboxId', {isActive: true})
  } catch (err) {
    throw utils.ErrorHelper.serverError(err)
  }
}

module.exports.getValidById = async _id => {
  try {
    return practiceModel.findById({
      _id,
      isActive: true
    }).populate('_coachInbox', 'inboxId', {isActive: true})
      .populate('_scenario', '_company _coach')
  } catch (err) {
    throw utils.ErrorHelper.serverError(err)
  }
}

module.exports.getCurrentByScenario = async (ids) => {
  return practiceModel.find({_scenario: {$in: ids}, status: 'current', isActive: true})
    .populate('_scenario', {
      _id: true,
      name: true,
      _criterias: true
    })
    .populate({
      path: '_user _coach',
      match: {isActive: true},
      select: {
        _id: true,
        firstName: true,
        lastName: true,
        avatarId: true,
        avatarColor: true,
        devices: true,
        email: true,
        lang: true,
        messagesCount: true,
        videosCount: true
      }
    })
    .populate({
      path: '_userInbox _coachInbox',
      populate: {
        path: '_user _recipient',
        match: {isActive: true},
        select: {
          _id: true,
          firstName: true,
          lastName: true,
          avatarId: true,
          avatarColor: true,
          devices: true,
          lang: true,
          messagesCount: true,
          videosCount: true
        }
      }
    })
    .populate('coachMark._criteria userMark._criteria')
    .catch((err) => {
      throw utils.ErrorHelper.serverError(err)
    })
}

module.exports.getPracticeStatus = async (scenarioId) => {
  try {
    const practices = await practiceModel.find({_scenario: scenarioId, isActive: true})
    let practiceStatus = {
      evaluated: 0,
      total: 0
    }

    practices.forEach((practice) => {
      practiceStatus.total++
      if (practice.status === 'complete') {
        practiceStatus.evaluated++
      }
    })

    return practiceStatus
  } catch (err) {
    throw utils.ErrorHelper.serverError(err)
  }
}

module.exports.findOne = (query) => {
  return practiceModel.findOne(query)
}

module.exports.getUsersPracticeByScenario = async (scenarioId, usersIds = []) => {
  const query = { _scenario: scenarioId, isActive: true }
  if (usersIds.length) {
    query._user = { $in: usersIds }
  }

  return practiceModel
    .find(query)
    .populate('_user')
    .populate('_userInbox')
    .lean()
}
