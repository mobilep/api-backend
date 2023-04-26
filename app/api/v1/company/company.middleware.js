'use strict'

const daoUser = require('../user/user.dao')
const daoCompany = require('./company.dao')

module.exports.checkCompanyAdmin = (req, res, next) => {
  const user = req.user
  const companyId = req.param('companyId')

  return daoCompany.getById(companyId).then((company) => {
    if (!company) {
      throw utils.ErrorHelper.forbidden('ERROR_INVALID_COMPANY')
    }

    req.company = company

    return daoUser.getOne({
      _id: user._id,
      $or: [{isCompanyAdmin: true, _company: company._id}, {isSysAdmin: true}]
    })
  }).then((companyAdmin) => {
    if (!companyAdmin) {
      throw utils.ErrorHelper.forbidden('ERROR_ACCESS_DENIED')
    }

    return next()
  }).catch((err) => {
    return next(err)
  })
}

module.exports.checkAdminOrManager = (req, res, next) => {
  const user = req.user
  const companyId = req.param('companyId')

  return daoCompany.getById(companyId).then((company) => {
    if (!company) {
      throw utils.ErrorHelper.forbidden('ERROR_INVALID_COMPANY')
    }

    req.company = company

    return daoUser.getOne({
      _id: user._id,
      $or: [
        {isCompanyAdmin: true, _company: company._id},
        {managerCriteria: {$exists: true, $ne: ''}, _company: company._id},
        {isSysAdmin: true}]
    })
  }).then((result) => {
    if (!result) {
      throw utils.ErrorHelper.forbidden('ERROR_ACCESS_DENIED')
    }
    if (!result.isSysAdmin && !result.isCompanyAdmin && result.managerCriteria) {
      req.isManager = true
    }

    return next()
  }).catch((err) => {
    return next(err)
  })
}

module.exports.checkCompanyAdminOrMe = (req, res, next) => {
  const user = req.user
  const companyId = req.param('companyId')
  const userId = req.param('userId')

  return daoCompany.getById(companyId).then((company) => {
    if (!company) {
      throw utils.ErrorHelper.forbidden('ERROR_INVALID_COMPANY')
    }

    req.company = company

    return daoUser.getOne({
      _id: user._id,
      $or: [
        {
          isCompanyAdmin: true,
          _company: company._id
        },
        {isSysAdmin: true},
        {_id: userId}]
    })
  }).then((companyAdmin) => {
    if (!companyAdmin) {
      throw utils.ErrorHelper.forbidden('ERROR_ACCESS_DENIED')
    }

    return next()
  }).catch((err) => {
    return next(err)
  })
}

module.exports.checkCompanyUser = (req, res, next) => {
  const user = req.user
  const companyId = req.param('companyId')
  return daoCompany.getById(companyId).then((company) => {
    if (!company) {
      throw utils.ErrorHelper.forbidden('ERROR_INVALID_COMPANY')
    }

    req.company = company

    return daoUser.getOne({_id: user._id, $or: [{_company: company._id}, {isSysAdmin: true}]})
  }).then((companyUser) => {
    if (!companyUser) {
      throw utils.ErrorHelper.forbidden('ERROR_ACCESS_DENIED')
    }
    return next()
  }).catch((err) => {
    return next(err)
  })
}
