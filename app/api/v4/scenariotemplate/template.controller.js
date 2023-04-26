'use strict'

const daoTemplate = require('./template.dao')
const daoUser = require('./../user/user.dao')
const daoTeam = require('../team/team.dao')
const helperTemplate = require('./template.helper')
const serviceScenario = require('./../scenario/scenario.service')
const moment = require('moment')
const ObjectId = require('mongoose').Types.ObjectId

module.exports.create = async (req, res, next) => {
  try {
    const defaultDueDate = moment.utc().hours(23).minutes(59).add(21, 'd')
    const minDueDate = moment.utc().hours(23).minutes(59).add(1, 'd')

    const result = helperTemplate.validateCreate(req.body, defaultDueDate, minDueDate)
    result._company = req.company._id

    const template = await daoTemplate.create(result)
    res.json(template)
  } catch (err) {
    console.log('err', err)
    return next(err)
  }
}

module.exports.assignCoaches = async (req, res, next) => {
  try {
    const coachIds = helperTemplate.validateAssignCoaches(req.body)
    const companyId = req.company._id

    const queryCoaches = {_id: {$in: coachIds}, _company: companyId, isActive: true}
    const coaches = await daoUser.get(queryCoaches)
    if (coaches.length < coachIds.length) {
      // try assign coach from other company
      throw utils.ErrorHelper.forbidden()
    }

    const queryTemplate = {_id: req.params.templateId, _company: companyId, isActive: true}
    const template = await daoTemplate.findOne(queryTemplate)
    if (!template) {
      // try to use template from other company
      throw utils.ErrorHelper.forbidden()
    }

    const scenario = helperTemplate.copyTemplate(template)

    if (!scenario.canEditVideo) {
      const coachIdsFilter = coachIds.map(id => ObjectId(id))
      const coachTeams = await daoTeam.getTeamsWithActiveUsers({isDefault: true, _owner: {$in: coachIdsFilter}})
      if (coachTeams.length !== coachIds.length) {
        throw utils.ErrorHelper.badRequest(`Not all coaches have teams`)
      }
    }

    const promises = []
    coaches.forEach(coach => {
      const assignScenario = {
        user: coach._id,
        sentAt: Date.now()
      }
      template.logs.push(assignScenario)
      scenario._coach = coach
      if (scenario.canEditVideo) {
        promises.push(serviceScenario.createDraftFromTemplate(scenario))
      } else {
        promises.push(serviceScenario.assignScenarioToCoachTeam(scenario))
      }
    })

    await Promise.all(promises)
    await template.save()

    res.sendStatus(204)
  } catch (err) {
    console.log('err', err)
    return next(err)
  }
}

module.exports.edit = async (req, res, next) => {
  try {
    const templateId = req.params.templateId
    const defaultDueDate = moment.utc().hours(23).minutes(59).add(21, 'd')
    const result = helperTemplate.validateUpdate(req.body, defaultDueDate)

    const template = await daoTemplate.update(templateId, result)
    res.json(template)
  } catch (err) {
    console.log('err', err)
    return next(err)
  }
}

module.exports.delete = async (req, res, next) => {
  try {
    const templateIds = helperTemplate.validateTemplatesToDelete(req.body)
    const companyId = req.company._id

    await daoTemplate.bulkDelete({_id: {$in: templateIds}, _company: companyId})
    res.sendStatus(204)
  } catch (err) {
    console.log('err', err)
    return next(err)
  }
}

module.exports.get = async (req, res, next) => {
  try {
    const companyId = req.company._id
    const templates = await daoTemplate.find({_company: companyId})

    res.json(helperTemplate.filterGetAll(templates))
  } catch (err) {
    console.log('err', err)
    return next(err)
  }
}

module.exports.getOne = async (req, res, next) => {
  try {
    const companyId = req.company._id
    const templateId = req.params.templateId

    const template = await daoTemplate.findOne({_company: companyId, _id: templateId})
    if (!template) {
      throw utils.ErrorHelper.notFound('Template does not exist')
    }

    res.json(helperTemplate.filterGetOne(template))
  } catch (err) {
    console.log('err', err)
    return next(err)
  }
}
