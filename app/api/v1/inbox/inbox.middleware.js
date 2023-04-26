'use strict'

const daoInbox = require('./inbox.dao')

module.exports.checkInboxOwner = (req, res, next) => {
  const user = req.user
  const inboxId = req.params.inboxId
  daoInbox.getById(inboxId).then((inbox) => {
    if (!inbox) {
      throw utils.ErrorHelper.badRequest('ERROR_INVALID_INBOX')
    }

    if (!inbox._user.equals(user._id)) {
      throw utils.ErrorHelper.forbidden('ERROR_ACCESS_DENIED')
    }
    req.inbox = inbox
    return next()
  }).catch((err) => {
    return next(err)
  })
}
