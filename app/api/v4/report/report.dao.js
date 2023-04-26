const practiceModel = require('../../../models/practice.model')
const scenarioModel = require('../../../models/scenario.model')
const userModel = require('../../../models/user.model')
const mpchatModel = require('../../../models/mpchat.model')
const inboxModel = require('../../../models/inbox.model')
const helperScenario = require('./../scenario/scenario.helper')

module.exports.userStatistics = async (company, user, coach) => {
  const scenariosInCompany = await scenarioModel.find({_company: company, isActive: true, _coach: coach})
  const scenariosIds = scenariosInCompany.map(s => s._id)

  const q = {isActive: true, _user: user, _scenario: {$in: scenariosIds}}
  return practiceModel.aggregate()
    .match(q)
    .group({
      _id: '$status',
      sum: {$sum: 1}
    })
}

module.exports.userAvgMark = async (company, user, filter) => {
  const scenariosInCompany = await scenarioModel.find({_company: company, isActive: true, ...filter})
  const scenariosIds = scenariosInCompany.map(s => s._id)

  const q = {isActive: true, _user: user, _scenario: {$in: scenariosIds}, status: 'complete'}
  return practiceModel.aggregate()
    .match(q)
    .unwind({path: '$coachMark'})
    .group({
      _id: '$_id',
      userEvaluatedAt: {$first: '$userEvaluatedAt'},
      scenario: {$first: '$_scenario'},
      avgMark: {$avg: '$coachMark.mark'}
    })
    .lookup({
      from: 'scenarios',
      localField: 'scenario',
      foreignField: '_id',
      as: 'scenario'
    })
    .unwind('scenario')
    .project({
      _id: '$scenario._id',
      name: '$scenario.name',
      evaluatedAt: '$userEvaluatedAt',
      avgMark: 1
    })
    .group({
      _id: null,
      avgUserMark: {$avg: '$avgMark'},
      data: {$addToSet: '$$ROOT'}
    })
    .unwind('data')
    .sort({'data.evaluatedAt': -1})
    .group({
      _id: null,
      avgUserMark: {$first: '$avgUserMark'},
      data: {'$push': '$data'}
    })
}

module.exports.userResponsiveness = async (company, user, filter) => {
  const scenariosInCompany = await scenarioModel.find({_company: company, isActive: true, ...filter})
  const scenariosIds = scenariosInCompany.map(s => s._id)

  const q = {isActive: true, _user: user, _scenario: {$in: scenariosIds}}

  return practiceModel.aggregate()
    .match(q)
    .addFields({
      responsiveness: {$subtract: ['$userFirstVideoAt', '$createdAt']}
    })
    .project({
      _id: 0,
      _scenario: 1,
      responsiveness: 1,
      userFirstVideoAt: 1
    })
    .group({
      _id: null,
      responsiveness: {$avg: '$responsiveness'},
      data: {$addToSet: '$$ROOT'}
    })
    .unwind('data')
    .sort({'data.userFirstVideoAt': -1})
    .group({
      _id: null,
      responsiveness: {$first: '$responsiveness'},
      data: {'$push': '$data'}
    })
}

module.exports.teamAvgMark = async (company, filter, dateFilter = {}) => {
  const scenariosInCompany = await scenarioModel.find({_company: company, isActive: true, ...filter})
  const scenariosIds = scenariosInCompany.map(s => s._id)

  const q = {isActive: true, _scenario: {$in: scenariosIds}, status: 'complete', ...dateFilter}

  return practiceModel.aggregate()
    .match(q)
    .unwind({path: '$coachMark'})
    .group({
      _id: '$_id',
      scenario: {$first: '$_scenario'},
      avgMark: {$avg: '$coachMark.mark'}
    })
    .group({
      _id: '$scenario',
      avg: {$avg: '$avgMark'}
    })
    .group({
      _id: null,
      avgTeamMark: {$avg: '$avg'},
      data: {$addToSet: '$$ROOT'}
    })
}

module.exports.teamResponsiveness = async (company, filter) => {
  const scenariosInCompany = await scenarioModel.find({_company: company, isActive: true, ...filter})
  const scenariosIds = scenariosInCompany.map(s => s._id)

  const q = {isActive: true, _scenario: {$in: scenariosIds}}

  return practiceModel.aggregate()
    .match(q)
    .addFields({
      responsiveness: {$subtract: ['$userFirstVideoAt', '$createdAt']}
    })
    .group({
      _id: '$_scenario',
      responsiveness: {$avg: '$responsiveness'}
    })
    .lookup({
      from: 'scenarios',
      localField: '_id',
      foreignField: '_id',
      as: '_id'
    })
    .unwind('_id')
    .project({
      _id: '$_id._id',
      name: '$_id.name',
      responsiveness: 1
    })
    .group({
      _id: null,
      responsiveness: {$avg: '$responsiveness'},
      data: {$addToSet: '$$ROOT'}
    })
}

module.exports.teamStatistics = (company, coach) => {
  const q = {_company: company, isActive: true, _coach: coach}
  return scenarioModel.aggregate()
    .match(q)
    .group({
      _id: '$type',
      sum: {$sum: 1}
    })
}

module.exports.getCoachesOfUser = async (company, user) => {
  const scenariosInCompany = await scenarioModel.find({_company: company, isActive: true})
  const scenariosIds = scenariosInCompany.map(s => s._id)

  const coachIds = await practiceModel.distinct('_coach', {_user: user, _scenario: {$in: scenariosIds}, isActive: true})
  return userModel.find({_id: {$in: coachIds}}).populate('_coach')
}

module.exports.userScoreDetails = (scenario, user) => {
  const q = {_scenario: scenario, _user: user}
  return practiceModel.findOne(q).populate('coachMark._criteria').populate('_scenario')
}

module.exports.teamScoreDetails = (scenario) => {
  return practiceModel.aggregate()
    .match({_scenario: scenario, isActive: true})
    .unwind('coachMark')
    .group({
      _id: '$coachMark._criteria',
      avg: {$avg: '$coachMark.mark'}
    })
}

module.exports.scoreRanking = async (company) => {
  const scenariosInCompany = await scenarioModel.find({_company: company, isActive: true})
  const scenariosIds = scenariosInCompany.map(s => s._id)

  const q = {isActive: true, _scenario: {$in: scenariosIds}}
  return practiceModel.aggregate()
    .match(q)
    .unwind({path: '$coachMark'})
    .group({
      _id: '$_id',
      scenario: {$first: '$_scenario'},
      coach: {$first: '$_coach'},
      avgMark: {$avg: '$coachMark.mark'}
    })
    .group({
      _id: '$scenario',
      avg: {$avg: '$avgMark'},
      coach: {$first: '$coach'}
    })
    .group({
      _id: '$coach',
      avgTeamMark: {$avg: '$avg'}
    })
    .sort({avgTeamMark: -1})
}

module.exports.responsivenessRanking = async (company) => {
  const scenariosInCompany = await scenarioModel.find({_company: company, isActive: true})
  const scenariosIds = scenariosInCompany.map(s => s._id)

  const q = {isActive: true, _scenario: {$in: scenariosIds}}
  return practiceModel.aggregate()
    .match(q)
    .addFields({
      responsiveness: {$subtract: ['$userFirstVideoAt', '$createdAt']}
    })
    .group({
      _id: '$_scenario',
      responsiveness: {$avg: '$responsiveness'},
      coach: {$first: '$_coach'}
    })
    .group({
      _id: '$coach',
      responsiveness: {$avg: '$responsiveness'}
    }) // sort null at the end
    .addFields({
      fieldType: {$type: '$responsiveness'}
    })
    .sort({fieldType: 1, responsiveness: 1})
}

module.exports.userListByScore = async (company, filter) => {
  const scenariosInCompany = await scenarioModel.find({_company: company, isActive: true, ...filter})
  const scenariosIds = scenariosInCompany.map(s => s._id)

  const q = {isActive: true, _scenario: {$in: scenariosIds}, status: 'complete'}

  return practiceModel.aggregate()
    .match(q)
    .unwind({path: '$coachMark'})
    .lookup({
      from: 'users',
      localField: '_user',
      foreignField: '_id',
      as: '_user'
    })
    .unwind({path: '$_user'})
    .group({
      _id: '$_id',
      avg: {$avg: '$coachMark.mark'},
      user: {$first: '$_user'}
    })
    .group({
      _id: '$user._id',
      avgMark: {$avg: '$avg'},
      user: {$first: '$user'}
    })
    .sort({avgMark: -1})
}

module.exports.userListByResponsiveness = async (company, filter) => {
  const scenariosInCompany = await scenarioModel.find({_company: company, isActive: true, ...filter})
  const scenariosIds = scenariosInCompany.map(s => s._id)

  const q = {isActive: true, _scenario: {$in: scenariosIds}}

  return practiceModel.aggregate()
    .match(q)
    .addFields({
      responsiveness: {$subtract: ['$userFirstVideoAt', '$createdAt']}
    })
    .lookup({
      from: 'users',
      localField: '_user',
      foreignField: '_id',
      as: '_user'
    })
    .unwind({path: '$_user'})
    .group({
      _id: '$_user._id',
      responsiveness: {$avg: '$responsiveness'},
      user: {$first: '$_user'}
    }) // sort null at the end
    .addFields({
      fieldType: {$type: '$responsiveness'}
    })
    .sort({fieldType: 1, responsiveness: 1})
}

module.exports.getCoachesInCompany = (company) => {
  return scenarioModel.distinct('_coach', {_company: company, isActive: true})
}

module.exports.getLearnersInCompany = async (company, filter) => {
  const scenariosInCompany = await scenarioModel.find({_company: company, isActive: true, ...filter})
  const scenariosIds = scenariosInCompany.map(s => s._id)

  return practiceModel.distinct('_user',
    {_scenario: {$in: scenariosIds}, isActive: true})
}

module.exports.getEvaluatedPractices = async (company, filter) => {
  const scenariosInCompany = await scenarioModel.find({_company: company, isActive: true, ...filter})
  const scenariosIds = scenariosInCompany.map(s => s._id)

  return practiceModel.find({_scenario: {$in: scenariosIds}, status: 'complete', isActive: true})
}

module.exports.countMessages = async (company, filter, learners) => {
  const scenariosInCompany = await scenarioModel.find({_company: company, groupChat: {$exists: true}, isActive: true, ...filter})
  const scenariosIds = scenariosInCompany.map(s => s._id)

  const practices = await practiceModel.find({isActive: true, _scenario: {$in: scenariosIds}}).populate('_scenario')
  const mpchats = await mpchatModel.find({_moderator: {$in: learners}, type: 'inbox', isActive: true})
  const inboxes = await inboxModel.find({_user: {$in: learners}, type: 'inbox', isActive: true})

  const chatLinks = []
  const inboxLinks = []

  scenariosInCompany.map(scenario => {
    const mpchat = scenario.groupChat.split('/').slice(-1)
    chatLinks.push(`mpchat/${mpchat}/messages`)
  })

  practices.map(practice => {
    chatLinks.push(`chats/${practice._coach}/${practice._scenario._id}/${practice._id}/${practice._coachInbox}`)
  })

  mpchats.map(chat => {
    chatLinks.push(`${chat.chatId}/messages`)
  })

  inboxes.map(inbox => {
    const existingLink = `inboxes/${inbox._recipient}/${inbox._user}`
    if (!inboxLinks.includes(existingLink)) {
      inboxLinks.push(`inboxes/${inbox._user}/${inbox._recipient}`)
      chatLinks.push(`inboxes/${inbox._user}/${inbox._recipient}/${inbox._id}`)
    }
  })

  const promises = []
  chatLinks.forEach(link => promises.push(helperScenario.getMessageFromFirebase(link)))
  const result = await Promise.all(promises)
  const messages = result.map(res => helperScenario.pretifyMessages(res))
  const flattened = [].concat(...messages)
  return flattened
}

module.exports.responsivenessByScenarios = async (scenariosInCompany) => {
  const scenariosIds = scenariosInCompany.map(s => s._id)

  const q = {isActive: true, _scenario: {$in: scenariosIds}}

  const oneDay = 86400000
  const threeDays = 259200000
  const fiveDays = 432000000
  const withoutResponse = 1000 // number for correct sorting

  return practiceModel.aggregate()
    .match(q)
    .addFields({
      responsiveness: {$subtract: ['$userFirstVideoAt', '$createdAt']}
    })
    .group({
      _id: '$_scenario',
      responsiveness: {$avg: '$responsiveness'}
    })
    .group({
      _id: {
        $cond: [
          {$eq: ['$responsiveness', null]},
          {from: withoutResponse},
          { $cond: [{ $lte: [ '$responsiveness', oneDay ] },
            {from: 0, to: 1},
            { $cond: [
              { $lte: [ '$responsiveness', threeDays ] },
              {from: 2, to: 3},
              { $cond: [
                { $lte: [ '$responsiveness', fiveDays ] },
                {from: 4, to: 5},
                { $cond: [
                  { $gt: [ '$responsiveness', fiveDays ] },
                  {from: 6},
                  {from: withoutResponse}
                ]}
              ]}
            ]}
          ]}
        ]
      },
      count: {$sum: 1}
    })
    .project({
      _id: 0,
      range: '$_id',
      count: '$count'
    })
    .group({
      _id: null,
      data: {$addToSet: '$$ROOT'},
      count: {$sum: '$count'}
    })
    .project({
      _id: 0
    })
    .unwind('data')
    .sort({'data.range.from': 1})
    .group({
      _id: null,
      count: {$first: '$count'},
      data: {'$push': '$data'}
    })
}

module.exports.scenarioLength = async (scenariosInCompany) => {
  const scenariosIds = scenariosInCompany.map(s => s._id)

  const q = {isActive: true, _id: {$in: scenariosIds}}

  const fiveDays = 432000000
  const tenDays = 864000000
  const twentyDays = 1728000000

  return scenarioModel.aggregate()
    .match(q)
    .addFields({
      length: {$subtract: ['$dueDate', '$createdAt']}
    })
    .group({
      _id: {
        $cond: [
          {$eq: ['$length', null]},
          {from: 21},
          { $cond: [{ $lte: [ '$length', fiveDays ] },
            {from: 1, to: 5},
            { $cond: [
              { $lte: [ '$length', tenDays ] },
              {from: 6, to: 10},
              { $cond: [
                { $lte: [ '$length', twentyDays ] },
                {from: 11, to: 20},
                { $cond: [
                  { $gt: [ '$length', twentyDays ] },
                  {from: 21},
                  {from: 21}
                ]}
              ]}
            ]}
          ]}
        ]
      },
      count: {$sum: 1}
    })
    .project({
      _id: 0,
      range: '$_id',
      count: '$count'
    })
    .group({
      _id: null,
      data: {$addToSet: '$$ROOT'},
      count: {$sum: '$count'}
    })
    .project({
      _id: 0
    })
    .unwind('data')
    .sort({'data.range.from': 1})
    .group({
      _id: null,
      count: {$first: '$count'},
      data: {'$push': '$data'}
    })
}
