'use strict'

module.exports.checkSpec = (req, res, next) => {
  const token = req.headers.authorization

  if (!token) {
    return next(utils.ErrorHelper.unauthorized('ERROR_INVALID_TOKEN'))
  }

  if (token !== '714a2d5a-1fbb-4cb5-86ec-a540c26da42d') {
    return next(utils.ErrorHelper.unauthorized('ERROR_INVALID_TOKEN'))
  }

  next()
}
