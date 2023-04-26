'use strict'

const helperCompany = require('./company.helper.js')
const daoCompany = require('./company.dao')
const daoUser = require('../user/user.dao')
const intercomEmitter = require('../intercom/IntercomEmitter')
const UsersImporter = require('./UsersImporter.class')
const _ = require('lodash')

module.exports.create = (req, res, next) => {
  const result = helperCompany.validateCreate(req.body)

  return daoCompany.create(result).then((company) => {
    res.json(company)
  }).catch((err) => {
    return next(err)
  })
}

module.exports.inviteUsers = (req, res, next) => {
  const users = helperCompany.validateInviteUsers(req.body)
  // if company admin -> should be password. If reqular user -> no password
  for (let i = 0; i < users.length; i++) {
    if (users[i].isCompanyAdmin && !users[i].password) {
      return next(utils.ErrorHelper.badRequest())
    }

    if (!users[i].isCompanyAdmin && users[i].password) {
      return next(utils.ErrorHelper.badRequest())
    }
  }

  const promises = []
  users.forEach((user) => {
    user._company = req.company._id
    user.avatarColor = _.sample([
      '58c9ef',
      '2be39c',
      'a457ec',
      'ffbe42',
      'e9d340',
      '3cd861',
      'f946e9',
      '00cdbb',
      'fd524f',
      '6c6ced'])
    promises.push(daoUser.create(user))
  })

  return Promise.all(promises).then((createdUsers) => {
    res.json(createdUsers)
  }).catch((err) => {
    console.log('err', err)
    return next(err)
  })
}

module.exports.get = (req, res) => {
  return res.json(req.company)
}

module.exports.edit = (req, res, next) => {
  const result = helperCompany.validateEdit(req.body)

  return daoCompany.edit(req.company._id, result).then((company) => {
    intercomEmitter.emit('deleteCompany', {id: company._id})
    return res.json(company)
  }).catch((err) => {
    console.log('err', err)
    return next(err)
  })
}

module.exports.delete = (req, res, next) => {
  return daoCompany.delete({_id: req.param('companyId')}).then((company) => {
    // make all user inactive if we delete company
    return daoUser.makeUsersInactive(company._id)
      .then(() => {
        return res.json(company)
      })
  }).catch((err) => {
    console.log('err', err)
    return next(err)
  })
}

module.exports.sendInvite = (req, res, next) => {
  const userIds = helperCompany.validateSendInvite(req.body)

  const query = {_id: {$in: userIds}, _company: req.company._id, isActive: true}

  return daoUser.get(query).then((users) => {
    if (users.length < userIds.length) {
      // try invite user from other company
      throw utils.ErrorHelper.forbidden()
    }

    const invitePromises = []
    users.forEach((user) => {
      const userFirstName = user.firstName
      invitePromises.push(
        utils.Mail.sendInviteEmail(user.resetToken, user.email, userFirstName, req.company.name,
          user.lang))
    })

    return Promise.all(invitePromises)
      .then(() => {
        // update flag isInviteSent
        return daoUser.bulkUpdate(query, {isInviteSent: true})
      })
      .then(() => {
        res.json(users)
      })
  }).catch((err) => {
    console.log('err', err)
    return next(err)
  })
}

module.exports.sendTestEmail = (req, res, next) => {
  const result = helperCompany.validateSendTestEmail(req.body)
  return utils.Mail.sendInviteEmail(null, result.email, '', req.company.name, result.lang)
    .then(() => res.sendStatus(204))
    .catch((err) => {
      next(err)
    })
}

module.exports.getAll = (req, res, next) => {
  return daoCompany.find().then((companies) => {
    res.json(companies)
  }).catch((err) => {
    return next(err)
  })
}

const csv = require('csv')
const multer = require('multer')

const fileFilter = (req, file, cb) => {
  // The function should call `cb` with a boolean
  // to indicate if the file should be accepted
  if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel' ||
      file.mimetype === 'application/octet-stream') {
    // To accept the file pass `true`, like so:
    cb(null, true)
  } else {
    console.log('CSV IMPORT: file mimetype', file.mimetype)
    // To reject this file pass `false`, like so:
    // You can always pass an error if something goes wrong:
    cb(utils.ErrorHelper.badRequest('ERROR_INVALID_CSV_FILE'))
  }
}
const upload = multer({
  fileFilter: fileFilter
}).single('importCsvFile')

module.exports.import = (req, res, next) => {
  const _company = req.company._id
  upload(req, res, (err) => {
    if (err) return next(err)
    if (!req.file) return next(utils.ErrorHelper.badRequest('ERROR_INVALID_CSV_FILE'))
    csv.parse(req.file.buffer.toString(), {delimiter: ','},
      async (err, data) => {
        if (err) {
          return next(utils.ErrorHelper.badRequest(err.message)) // ??
        }
        if (data.length > 100) return next(utils.ErrorHelper.badRequest('ERROR_LONG_CSV_FILE'))
        const importer = new UsersImporter(data, _company)
        const result = await importer.doImport()
        res.json(result)
      }
    )
  })
}
