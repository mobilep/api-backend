'use strict'

const modelCriteria = require('../../../models/criteria.model')

module.exports.create = (data) => {
  data.name = data.name.trim()
  return modelCriteria.findOne({name: data.name, _company: data._company})
    .then((existingName) => {
      if (existingName) {
        throw utils.ErrorHelper.badRequest('ERROR_CRITERIA_EXIST')
      }
      return modelCriteria.create(data)
    })
    .then((data) => {
      return data
    })
}

module.exports.edit = (id, companyId, data) => {
  let name = ''
  if (data.name) {
    name = data.name.trim()
  }
  return modelCriteria.findOne({name: name, _company: companyId})
    .then((existingName) => {
      if (existingName) {
        throw utils.ErrorHelper.badRequest('ERROR_CRITERIA_EXIST')
      }
      return modelCriteria.findOne({_id: id, _company: companyId})
    })
    .then((criteria) => {
      if (!criteria) {
        throw utils.ErrorHelper.badRequest('ERROR_INVALID_CRITERIA')
      }

      criteria.name = (data.name) ? data.name : criteria.name
      criteria.info = (data.info) ? data.info : criteria.info

      return criteria.save()
    })
}

module.exports.findByCompany = (companyId) => {
  return modelCriteria.find({_company: companyId}).sort('name')
    .then((criterias) => {
      return criterias
    })
    .catch((err) => {
      throw utils.ErrorHelper.serverError(err)
    })
}

module.exports.delete = (query) => {
  return modelCriteria.findOne(query).then((criteria) => {
    if (!criteria) {
      return
    }
    criteria.isActive = false
    return criteria.save()
  }).catch((err) => {
    throw utils.ErrorHelper.serverError(err)
  })
}

module.exports.findById = async criteriaId => {
  return modelCriteria.findById(criteriaId)
    .then((criterias) => {
      return criterias
    })
    .catch((err) => {
      throw utils.ErrorHelper.serverError(err)
    })
}
