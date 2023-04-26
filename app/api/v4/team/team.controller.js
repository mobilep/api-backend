'use strict'

const helperCriteria = require('./team.helper')
const helperTeam = require('./team.helper')
const daoTeam = require('./team.dao')
const intercomEmitter = require('../intercom/IntercomEmitter')

module.exports.create = (req, res, next) => {
  const result = helperCriteria.validateCreate(req.body)
  result._owner = req.user._id
  result._company = req.company._id
  result.isDefault = false
  return daoTeam.create(result).then((team) => {
    intercomEmitter.emit('group-created', result)
    res.json(team)
  }).catch((err) => {
    console.log('err', err)
    return next(err)
  })
}

module.exports.edit = (req, res, next) => {
  const result = helperCriteria.validateEdit(req.body)
  result._company = req.company._id
  result._owner = req.user._id
  return daoTeam.edit(req.params.teamId, result)
    .then((team) => {
      return res.json(team)
    })
    .catch((err) => {
      console.log('err', err)
      return next(err)
    })
}

module.exports.editV2 = async (req, res, next) => {
  try {
    const result = helperCriteria.validateEdit(req.body)
    result._company = req.company._id
    result._owner = req.user._id

    const currentTeam = await daoTeam.getById(req.params.teamId)
    if (currentTeam.isDefault) {
      for (const userId of result._users) {
        await helperTeam.deleteFromDefaultTeam(userId, result._company, req.params.teamId)
      }
    }

    const team = await daoTeam.editV2(req.params.teamId, result)

    return res.json(team)
  } catch (err) {
    console.log('err', err)
    return next(err)
  }
}

module.exports.getOne = (req, res, next) => {
  const q = {
    _id: req.params.teamId,
    _company: req.company._id,
    _owner: req.user._id
  }

  return daoTeam.getOne(q)
    .then((team) => {
      return res.json(team)
    })
    .catch((err) => {
      console.log('err', err)
      return next(err)
    })
}

module.exports.get = (req, res, next) => {
  const q = {
    _company: req.company._id,
    _owner: req.user._id
  }

  return daoTeam.findByCompany(q).then((teams) => {
    res.json(teams)
  }).catch((err) => {
    console.log('err', err)
    return next(err)
  })
}

module.exports.delete = (req, res, next) => {
  const company = req.company
  const query = {_id: req.params.teamId, _company: company._id, _owner: req.user._id}

  return daoTeam.delete(query).then((team) => {
    res.json(team)
  }).catch((err) => {
    console.log('err', err)
    return next(err)
  })
}
