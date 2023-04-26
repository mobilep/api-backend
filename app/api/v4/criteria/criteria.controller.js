'use strict'

const helperCriteria = require('./criteria.helper')
const daoCriteria = require('./criteria.dao')

module.exports.getUserCriterias = (req, res, next) => {
  res.json(daoCriteria.userCriterias)
}

module.exports.create = (req, res, next) => {
  const result = helperCriteria.validateCreate(req.body)
  result._company = req.company._id

  return daoCriteria.create(result).then((criteria) => {
    res.json(criteria)
  }).catch((err) => {
    console.log('err', err)
    return next(err)
  })
}

module.exports.edit = (req, res, next) => {
  const result = helperCriteria.validateEdit(req.body)
  const companyId = req.company._id

  return daoCriteria.edit(req.param('criteriaId'), companyId, result)
    .then((criteria) => {
      return res.json(criteria)
    })
    .catch((err) => {
      console.log('err', err)
      return next(err)
    })
}

module.exports.get = (req, res, next) => {
  const companyId = req.company._id

  return daoCriteria.findByCompany(companyId).then((criterias) => {
    res.json(criterias)
  }).catch((err) => {
    console.log('err', err)
    return next(err)
  })
}

module.exports.delete = (req, res, next) => {
  const company = req.company
  const query = {_id: req.param('criteriaId'), _company: company._id}

  return daoCriteria.delete(query).then((criteria) => {
    res.json(criteria)
  }).catch((err) => {
    console.log('err', err)
    return next(err)
  })
}
