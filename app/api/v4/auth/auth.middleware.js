'use strict'

const daoUser = require('../user/user.dao')

module.exports.checkAuthToken = (req, res, next) => {
  const token = req.headers.authorization
  if (!token) {
    return next(utils.ErrorHelper.unauthorized('ERROR_INVALID_TOKEN'))
  }
  return utils.Passport.extractAuthToken(token).then((decoded) => {
    if (!decoded || !decoded.userId) {
      console.log(decoded, 'decoded')
      throw utils.ErrorHelper.forbidden('ERROR_INVALID_TOKEN')
    }
    return daoUser.getById(decoded.userId)
  }).then((user) => {
    if (user === null) {
      throw utils.ErrorHelper.unauthorized('ERROR_INVALID_TOKEN')
    }

    req.user = user
    return next()
  }).catch((err) => {
    return next(err)
  })
}

module.exports.checkResetToken = (req, res, next) => {
  const token = req.headers.authorization
  if (!token) {
    return next(utils.ErrorHelper.unauthorized('ERROR_INVALID_TOKEN'))
  }
  return utils.Passport.extractResetToken(token)
    .then((decoded) => {
      if (!decoded || !decoded.userId || !decoded.hash) {
        throw utils.ErrorHelper.forbidden('ERROR_INVALID_TOKEN')
      }
      return daoUser.getById(decoded.userId).then((user) => {
        if (user === null) {
          throw utils.ErrorHelper.forbidden('ERROR_INVALID_TOKEN')
        }
        if (!user.password) {
          if (utils.Passport.encryptPassword(utils.Passport.encryptPassword(decoded.userId)) !== decoded.hash) {
            throw utils.ErrorHelper.forbidden('ERROR_ACCESS_DENIED')
          }
        } else {
          if (utils.Passport.encryptPassword(user.password) !== decoded.hash) {
            throw utils.ErrorHelper.forbidden('ERROR_ACCESS_DENIED')
          }
        }
        if (token !== user.resetToken) {
          throw utils.ErrorHelper.forbidden('ERROR_INVALID_TOKEN')
        }
        // user.resetToken = null
        // return user.save()
        return user
      })
    }).then((user) => {
      req.user = user
      return next()
    }).catch((err) => {
      console.log(err)
      return next(err)
    })
}

module.exports.checkQueryToken = (req, res, next) => {
  const token = req.query.Authorization
  if (!token) {
    return next(utils.ErrorHelper.unauthorized('ERROR_INVALID_TOKEN'))
  }
  return utils.Passport.extractAuthToken(token).then((decoded) => {
    if (!decoded || !decoded.userId) {
      throw utils.ErrorHelper.forbidden('ERROR_INVALID_TOKEN')
    }
    return daoUser.getById(decoded.userId)
  }).then((user) => {
    if (user === null) {
      throw utils.ErrorHelper.unauthorized('ERROR_INVALID_TOKEN')
    }

    req.user = user
    return next()
  }).catch((err) => {
    return next(err)
  })
}
