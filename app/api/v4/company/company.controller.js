'use strict'

const helperCompany = require('./company.helper.js')
const daoCompany = require('./company.dao')
const daoUser = require('../user/user.dao')
const helperTeam = require('../team/team.helper')
const intercomEmitter = require('../intercom/IntercomEmitter')
const UsersImporter = require('./UsersImporter.class')
const _ = require('lodash')
const events = require('events')
const emmiter = new events.EventEmitter()

module.exports.create = (req, res, next) => {
  const result = helperCompany.validateCreate(req.body)

  return daoCompany.create(result).then((company) => {
    res.json(company)
  }).catch((err) => {
    return next(err)
  })
}

module.exports.inviteUsers = async (req, res, next) => {
  try {
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
      user.isMailNotification = req.company.isMailNotification
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
    const createdUsers = await Promise.all(promises)

    const promisesAssignCoach = []
    const resultUsers = []
    createdUsers.forEach(user => {
      promisesAssignCoach.push(helperTeam.assignCoach(user._coach, req.company._id, user._id))
      const userWithCoach = user
      userWithCoach._coach = user._coach ? user._coach : null
      resultUsers.push(userWithCoach)
    })
    await Promise.all(promisesAssignCoach)
    res.json(resultUsers)
  } catch (err) {
    console.log('err', err)
    return next(err)
  }
}

module.exports.get = (req, res) => {
  return res.json(req.company)
}

module.exports.edit = async (req, res, next) => {
  const result = helperCompany.validateEdit(req.body)

  try {
    const company = await daoCompany.edit(req.company._id, result)
    intercomEmitter.emit('deleteCompany', {id: company._id})

    const users = await daoUser.get({_company: company._id}, null, true)
    const userIds = users.map(user => user._id)
    const query = {_id: {$in: userIds}, _company: company._id, isActive: true}
    await daoUser.bulkUpdate(query, {isMailNotification: company.isMailNotification})

    return res.json(company)
  } catch (err) {
    console.log('err', err)
    return next(err)
  }
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
  const isMailNotification = req.company.isMailNotification
  upload(req, res, (err) => {
    if (err) return next(err)
    if (!req.file) return next(utils.ErrorHelper.badRequest('ERROR_INVALID_CSV_FILE'))
    csv.parse(req.file.buffer.toString(), {delimiter: ','},
      async (err, data) => {
        if (err) {
          return next(utils.ErrorHelper.badRequest(err.message)) // ??
        }
        if (data.length > 10000) return next(utils.ErrorHelper.badRequest('ERROR_LONG_CSV_FILE'))
        emmiter.emit('startFileUpload', {data, _company, isMailNotification})
        res.sendStatus(204)
      })
  })
}

module.exports.importFileStatus = async (req, res, next) => {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  }
  res.writeHead(200, headers)
  res.write('\n')
  res.write(`data: ${JSON.stringify({status: 'connected'})}\n\n`)
  res.flush()

  const timeout = 3000
  let status = 'not started'
  let result = {}

  const msgs = setInterval(async () => {
    const id = (new Date()).toLocaleTimeString()
    res.write(`id: ${id}\n`)
    if (status === 'finished') {
      res.write(`data: ${JSON.stringify({status, result})}\n\n`)
    } else {
      res.write(`data: ${JSON.stringify({status})}\n\n`)
    }
    res.flush()
  }, timeout)

  const onClearInterval = () => {
    clearInterval(msgs)
  }

  const onStart = () => {
    status = 'loading'
  }

  const onFinish = (importResult) => {
    result = importResult
    status = 'finished'
  }

  emmiter.on('start', onStart)
  emmiter.on('finish', onFinish)
  emmiter.on('clearInterval', onClearInterval)
}

const onStartFileUpload = async (data) => {
  emmiter.emit('start')
  const importer = new UsersImporter(data.data, data._company, data.isMailNotification)
  const importResult = await importer.doImport()
  emmiter.emit('finish', importResult)
}

emmiter.on('startFileUpload', onStartFileUpload)
