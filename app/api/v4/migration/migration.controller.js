const daoMigration = require('./migration.dao')

const _config = require('../../../config/config.js')

// need to run this regulary
// add chats to scenarios created via ios app
module.exports.addChats = async (req, res, next) => {
  try {
    if (!req.body.migrationKey) {
      throw new Error('ERROR_INAVLID_BODY')
    }
    if (req.body.migrationKey !== _config.migrationKey) {
      throw utils.ErrorHelper.forbidden('ERROR_ACCESS_DENIED')
    }
    await daoMigration.addChats()
    res.sendStatus(204)
  } catch (err) {
    console.log('err', err)
    return next(err)
  }
}

// delete chats that where incorectly created
module.exports.deleteChats = async (req, res, next) => {
  try {
    if (!req.body.migrationKey) {
      throw new Error('ERROR_INAVLID_BODY')
    }
    if (req.body.migrationKey !== _config.migrationKey) {
      throw utils.ErrorHelper.forbidden('ERROR_ACCESS_DENIED')
    }
    await daoMigration.deleteChats()
    res.sendStatus(204)
  } catch (err) {
    console.log('err', err)
    return next(err)
  }
}

// add new property to existing teams
module.exports.addTeamProperty = async (req, res, next) => {
  try {
    if (!req.body.migrationKey) {
      throw new Error('ERROR_INAVLID_BODY')
    }
    if (req.body.migrationKey !== _config.migrationKey) {
      throw utils.ErrorHelper.forbidden('ERROR_ACCESS_DENIED')
    }
    const result = await daoMigration.addTeamProperty()
    res.json(result)
  } catch (err) {
    console.log('err', err)
    return next(err)
  }
}
