const ObjectId = require('mongoose').Types.ObjectId

const dtoReport = require('./report.dto')
const daoReport = require('./report.dao')
const helperReport = require('./report.helper')
const helperUser = require('../user/user.helper')
const daoUser = require('../user/user.dao')
const daoCriteria = require('../criteria/criteria.dao')
const daoScenario = require('../scenario/scenario.dao')

module.exports.learnerReport = async (req, res, next) => {
  try {
    const company = ObjectId(req.params.companyId)
    const user = ObjectId(req.user._id)

    const userCoaches = await daoReport.getCoachesOfUser(company, user)
    const coachIds = userCoaches.map(c => c._id)

    const filter = {_coach: {$in: coachIds}}

    const query = helperReport.validateReportQuery(req.query)

    if (query.from && query.to) {
      filter.createdAt = {$gt: +query.from, $lt: +query.to}
    }
    if (query.coach) {
      filter._coach = ObjectId(query.coach)
    }

    const userAvgMark = await daoReport.userAvgMark(company, user, filter)
    const userStatistics = await daoReport.userStatistics(company, user, filter._coach)
    const userResponsiveness = await daoReport.userResponsiveness(company, user, filter)
    const teamAvgMark = await daoReport.teamAvgMark(company, filter)
    const teamStatistics = await daoReport.teamStatistics(company, filter._coach)
    const teamResponsiveness = await daoReport.teamResponsiveness(company, filter)

    const response = dtoReport.learnerReport(userAvgMark, userStatistics,
      userResponsiveness, teamAvgMark,
      teamStatistics, teamResponsiveness)
    res.json(response)
  } catch (err) {
    console.log('err', err)
    return next(err)
  }
}

module.exports.coachesInCompany = async (req, res, next) => {
  try {
    const coaches = await daoReport.getCoachesOfUser(req.params.companyId, req.user._id)
    res.json(dtoReport.coaches(coaches))
  } catch (err) {
    console.log('err', err)
    return next(err)
  }
}

module.exports.scenarioDetails = async (req, res, next) => {
  try {
    const company = ObjectId(req.params.companyId)
    const scenario = ObjectId(req.params.scenarioId)
    const user = ObjectId(req.user._id)
    const filter = {_id: scenario}

    const practice = await daoReport.userScoreDetails(scenario, user)
    if (!practice) {
      return next(utils.ErrorHelper.badRequest('ERROR_INVALID_SCENARIO'))
    }
    const userAvgMark = await daoReport.userAvgMark(company, user, filter)
    const teamAvgMark = await daoReport.teamAvgMark(company, filter)
    const teamScoreDetails = await daoReport.teamScoreDetails(scenario)

    res.json(dtoReport.scenarioScores(
      practice.coachMark, practice._scenario,
      teamScoreDetails, null,
      userAvgMark, teamAvgMark))
  } catch (err) {
    console.log('err', err)
    return next(err)
  }
}

module.exports.coachReport = async (req, res, next) => {
  try {
    const company = ObjectId(req.params.companyId)
    const user = ObjectId(req.user._id)

    const teamFilter = {_coach: user}
    const companyFilter = {}
    const query = helperReport.validateReportQuery(req.query)

    if (query.from && query.to) {
      teamFilter.createdAt = {$gt: +query.from, $lt: +query.to}
      companyFilter.createdAt = {$gt: +query.from, $lt: +query.to}
    }

    const teamAvgMark = await daoReport.teamAvgMark(company, teamFilter)
    const companyAvgMark = await daoReport.teamAvgMark(company, companyFilter)
    const teamResponsiveness = await daoReport.teamResponsiveness(company, teamFilter)
    const companyResponsiveness = await daoReport.teamResponsiveness(company, companyFilter)
    const teamStatistics = await daoReport.teamStatistics(company, user)
    const scoreRanking = await daoReport.scoreRanking(company)
    const responsivenessRanking = await daoReport.responsivenessRanking(company)

    const response = dtoReport.coachReport(
      teamAvgMark,
      companyAvgMark,
      teamResponsiveness,
      companyResponsiveness,
      teamStatistics,
      scoreRanking,
      responsivenessRanking,
      user)
    res.json(response)
  } catch (err) {
    console.log('err', err)
    return next(err)
  }
}

module.exports.teamMembersScore = async (req, res, next) => {
  try {
    const company = ObjectId(req.params.companyId)
    const user = ObjectId(req.user._id)

    const teamFilter = {_coach: user}
    const companyFilter = {}
    const query = helperReport.validateReportQuery(req.query)

    if (query.from && query.to) {
      teamFilter.createdAt = {$gt: +query.from, $lt: +query.to}
      companyFilter.createdAt = {$gt: +query.from, $lt: +query.to}
    }

    const teamAvgMark = await daoReport.teamAvgMark(company, teamFilter)
    const companyAvgMark = await daoReport.teamAvgMark(company, companyFilter)
    const userList = await daoReport.userListByScore(company, teamFilter)

    res.json(dtoReport.userScoreList(teamAvgMark, companyAvgMark, userList))
  } catch (err) {
    console.log('err', err)
    return next(err)
  }
}

module.exports.teamMembersResponsiveness = async (req, res, next) => {
  try {
    const company = ObjectId(req.params.companyId)
    const user = ObjectId(req.user._id)

    const teamFilter = {_coach: user}
    const companyFilter = {}
    const query = helperReport.validateReportQuery(req.query)

    if (query.from && query.to) {
      teamFilter.createdAt = {$gt: +query.from, $lt: +query.to}
      companyFilter.createdAt = {$gt: +query.from, $lt: +query.to}
    }

    const teamResponsiveness = await daoReport.teamResponsiveness(company, teamFilter)
    const companyResponsiveness = await daoReport.teamResponsiveness(company, companyFilter)
    const userList = await daoReport.userListByResponsiveness(company, teamFilter)

    res.json(dtoReport.userResponsivenessList(teamResponsiveness, companyResponsiveness, userList))
  } catch (err) {
    console.log('err', err)
    return next(err)
  }
}

module.exports.scoreByScenario = async (req, res, next) => {
  try {
    const company = ObjectId(req.params.companyId)
    const user = ObjectId(req.user._id)
    const learner = ObjectId(req.params.userId)

    const filter = {_coach: user}
    const query = helperReport.validateReportQuery(req.query)

    if (query.from && query.to) {
      filter.createdAt = {$gt: +query.from, $lt: +query.to}
    }

    const userAvgMark = await daoReport.userAvgMark(company, learner, filter)
    const teamAvgMark = await daoReport.teamAvgMark(company, filter)
    const learnerDetails = await daoUser.getByIdWithDetails(learner)

    res.json(dtoReport.scoreByScenario(userAvgMark, teamAvgMark, learnerDetails))
  } catch (err) {
    console.log('err', err)
    return next(err)
  }
}

module.exports.responsivenessByScenario = async (req, res, next) => {
  try {
    const company = ObjectId(req.params.companyId)
    const user = ObjectId(req.user._id)
    const learner = ObjectId(req.params.userId)

    const filter = {_coach: user}
    const query = helperReport.validateReportQuery(req.query)

    if (query.from && query.to) {
      filter.createdAt = {$gt: +query.from, $lt: +query.to}
    }

    const userResponsiveness = await daoReport.userResponsiveness(company, learner, filter)
    const teamResponsiveness = await daoReport.teamResponsiveness(company, filter)
    const learnerDetails = await daoUser.getByIdWithDetails(learner)

    res.json(dtoReport.responsivenessByScenario(userResponsiveness, teamResponsiveness, learnerDetails))
  } catch (err) {
    console.log('err', err)
    return next(err)
  }
}

module.exports.learnerScenarioDetails = async (req, res, next) => {
  try {
    const company = ObjectId(req.params.companyId)
    const scenario = ObjectId(req.params.scenarioId)
    const learner = ObjectId(req.params.userId)
    const filter = {_id: scenario}

    const practice = await daoReport.userScoreDetails(scenario, learner)
    if (!practice) {
      return next(utils.ErrorHelper.badRequest('ERROR_INVALID_SCENARIO'))
    }

    const userAvgMark = await daoReport.userAvgMark(company, learner, filter)
    const teamAvgMark = await daoReport.teamAvgMark(company, filter)
    const teamScoreDetails = await daoReport.teamScoreDetails(scenario)
    const learnerDetails = await daoUser.getByIdWithDetails(learner)

    res.json(dtoReport.scenarioScores(
      practice.coachMark, practice._scenario,
      teamScoreDetails, learnerDetails,
      userAvgMark, teamAvgMark))
  } catch (err) {
    console.log('err', err)
    return next(err)
  }
}

module.exports.companyDashboard = async (req, res, next) => {
  try {
    console.log(1)
    const company = ObjectId(req.params.companyId)
    let coaches
    let filter = {}
    if (req.isManager) {
      console.log(2)
      const criteria = helperUser.parseManagerCriteria(req.user.managerCriteria)
      console.log(3)
      const coachList = await daoUser.getByCriteria(criteria, req.params.companyId)
      console.log(4)
      coaches = coachList.map(coach => ObjectId(coach._id))
      filter = {_coach: {$in: coaches}}
    } else {
      console.log(5)

      coaches = await daoReport.getCoachesInCompany(company)
    }
    console.log(6)

    const coachFilter = filter._coach ? filter._coach : {$exists: true}

    const criterias = await daoCriteria.findByCompany(company)
    console.log(7)

    const learners = await daoReport.getLearnersInCompany(company, filter)
    console.log(8)

    const evaluations = await daoReport.getEvaluatedPractices(company, filter)
    console.log(8)

    const scenarioStatistic = await daoReport.teamStatistics(company, coachFilter)
    console.log(9)

    const messages = await daoReport.countMessages(company, filter, learners)
    console.log(10)

    const avgScore = await daoReport.teamAvgMark(company, filter)
    console.log(11)

    const range = helperReport.timeRange()

    const thisWeek = await daoReport.teamAvgMark(company, filter, range.thisWeek)
    console.log(12)

    const previousWeek = await daoReport.teamAvgMark(company, filter, range.previousWeek)
    console.log(13)

    const thisMonth = await daoReport.teamAvgMark(company, filter, range.thisMonth)
    console.log(14)

    const previousMonth = await daoReport.teamAvgMark(company, filter, range.previousMonth)

    console.log(15)

    res.json(dtoReport.adminDashboard(scenarioStatistic, coaches, learners,
      evaluations, avgScore, criterias, messages, thisWeek, previousWeek,
      thisMonth, previousMonth))
  } catch (err) {
    console.log('err', err)
    return next(err)
  }
}

module.exports.adminCharts = async (req, res, next) => {
  try {
    const user = req.user
    const company = req.params.companyId
    let companyScenarios

    if (req.isManager) {
      try {
        const criteria = helperUser.parseManagerCriteria(user.managerCriteria)
        const coachList = await daoUser.getByCriteria(criteria, company)
        companyScenarios = await daoScenario.getByCoachList(coachList)
      } catch (e) {
        companyScenarios = []
      }
    } else {
      companyScenarios = await daoScenario.getAdminScenario(company)
    }

    const responsivenessStatistic = await daoReport.responsivenessByScenarios(companyScenarios)
    const scenarioLengthStatistic = await daoReport.scenarioLength(companyScenarios)

    res.json(dtoReport.adminCharts(responsivenessStatistic, scenarioLengthStatistic))
  } catch (err) {
    console.log('err', err)
    return next(err)
  }
}
