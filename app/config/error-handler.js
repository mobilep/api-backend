'use strict'

const errorHelper = require('./../utils/errorHelper')

module.exports = (app) => {
  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    const err = errorHelper.notFound('ERROR_NOT_FOUND')
    return next(err)
  })
  // error handler
  app.use((err, req, res, next) => {
    const locale = (req.user && req.user.lang) ? req.user.lang : 'en'
    const error = {
      code: err.code,
      error: err.error,
      message: i18n.__({phrase: err.message, locale: locale})
    }
    res.status(error.code).json(error)
  })
}
