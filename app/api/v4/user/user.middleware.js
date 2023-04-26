'use strict'

const daoUser = require('./user.dao')

module.exports.checkSysAdmin = (req, res, next) => {
  const user = req.user

  return daoUser.getOne({_id: user._id, isSysAdmin: true}).then((sysAdmin) => {
    if (!sysAdmin) {
      throw utils.ErrorHelper.forbidden('ERROR_ACCESS_DENIED')
    }
    return next()
  }).catch((err) => {
    return next(err)
  })
}

module.exports.checkAdmin = (req, res, next) => {
  const user = req.user

  return daoUser.getOne({_id: user._id, $or: [{isCompanyAdmin: true}, {isSysAdmin: true}]}).then((admin) => {
    if (!admin) {
      throw utils.ErrorHelper.forbidden('ERROR_ACCESS_DENIED')
    }
    return next()
  }).catch((err) => {
    return next(err)
  })
}
