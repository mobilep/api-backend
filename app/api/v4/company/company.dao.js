'use strict'

const companyModel = require('../../../models/company.model')

module.exports.create = (data) => {
  data.name = data.name.trim()
  return companyModel.findOne({name: data.name}).then((existingName) => {
    if (existingName) {
      throw utils.ErrorHelper.badRequest('ERROR_COMPANY_EXIST')
    }
    return companyModel.create(data)
  }).then((data) => {
    return data
  })
}

module.exports.edit = (id, data) => {
  let name = ''
  if (data.name) {
    name = data.name.trim()
  }
  return companyModel.findOne({_id: {$ne: id}, name: name})
    .then((existingName) => {
      if (existingName) {
        throw utils.ErrorHelper.badRequest('ERROR_COMPANY_EXIST')
      }
      return companyModel.findOne({_id: id, isActive: true})
    })
    .then((company) => {
      if (!company) {
        throw utils.ErrorHelper.badRequest('ERROR_INVALID_COMPANY')
      }
      company.name = (data.name) ? data.name : company.name
      company.info = (data.info || data.info === '') ? data.info : company.info
      company.sendReminder = (data.sendReminder) ? data.sendReminder : company.sendReminder
      company.isMailNotification = (data.isMailNotification !== undefined) ? data.isMailNotification : company.isMailNotification

      return company.save()
    })
}

module.exports.delete = (query) => {
  return companyModel.findOne(query).then((company) => {
    if (!company) {
      return
    }
    company.isActive = false
    return company.save()
  }).catch((err) => {
    throw utils.ErrorHelper.serverError(err)
  })
}

module.exports.getById = (id) => {
  return companyModel.findOne({_id: id, isActive: true}).catch((err) => {
    throw utils.ErrorHelper.serverError(err)
  })
}

module.exports.find = (query) => {
  if (!query) {
    query = {}
  }
  query.isActive = true

  return companyModel.find(query).collation({
    locale: 'en',
    numericOrdering: true,
    caseFirst: 'off'
  }).sort({name: 1}).then((companies) => {
    return companies
  }).catch((err) => {
    throw utils.ErrorHelper.serverError(err)
  })
}
