'use strict'
const intercomEmitter = require('../intercom/IntercomEmitter')
const userEventEmitter = require('./user.event').userEventEmitter
const uuid = require('node-uuid')
const userModel = require('../../../models/user.model')
const mongoose = require('mongoose')

module.exports.create = (data) => {
  return userModel.findOne({email: data.email.toLowerCase()}, {lean: true}).then((existingEmail) => {
    if (existingEmail) {
      throw utils.ErrorHelper.badRequest('ERROR_EMAIL_EXIST')
    }
    return userModel.create(data)
  })
    .then((rawUser) => userModel.populate(rawUser, '_company'))
    .then((user) => {
      userEventEmitter.emit('assignDemoScenario', user)
      intercomEmitter.emit('createUser', user)
      return user
    }).then((user) => {
      if (!user) throw utils.ErrorHelper.badRequest('ERROR_INVALID_USER')
      user.resetToken = utils.Passport.createResetToken(user, 24 * 60 * 60 * 7)
      return user.save()
    })
    .then((user) => {
      // Disable sending email while sign-up a user. We use only manual sending from admin dashboard.
      // utils.Mail.createPassEmail(user.email, user.resetToken, user.lang)
      return user
    })
}

module.exports.getByEmail = (email, opts) => {
  opts = opts || {}
  return userModel.findOne({email: email, isActive: true}, opts).catch((err) => {
    throw utils.ErrorHelper.serverError(err)
  })
}

module.exports.getByEmailAndCompany = (email, _company) => {
  return userModel.findOne({email: email, _company: _company, isActive: true}).lean().catch((err) => {
    throw utils.ErrorHelper.serverError(err)
  })
}

module.exports.getById = (id) => {
  return userModel.findOne({_id: id, isActive: true}).catch((err) => {
    throw utils.ErrorHelper.serverError(err)
  })
}

module.exports.getOne = (query) => {
  query.isActive = true
  return userModel.findOne(query).catch((err) => {
    throw utils.ErrorHelper.serverError(err)
  })
}

module.exports.getByCriteria = (criteria, _company) => {
  const match = {}
  if (criteria.ownFields.length === 0 && criteria.extraFields.length === 0) {
    throw new Error('EMPTY_MANAGER_CRITERIA')
  }
  criteria.ownFields.forEach((field) => {
    match[field.title] = {$in: field.values}
  })
  match._company = mongoose.Types.ObjectId(_company)
  const $and = criteria.extraFields.map((field) => {
    return {
      extraInformation: {$elemMatch: {title: field.title, description: {$in: field.values}}}
    }
  })
  if ($and.length > 0) {
    match.$and = $and
  }
  return userModel.find(match, '_id')
}

module.exports.get = (query, sort) => {
  query.isActive = true

  // Set a default sort order
  // Uses string format detailed here: https://mongoosejs.com/docs/api.html#query_Query-sort
  if (!sort) {
    sort = 'firstName lastName'
  }

  return userModel.find(query,
    'createdAt avatarColor avatarId isActive isInviteSent firstName lastName email postcode lang country messagesCount videosCount resetToken')
    .collation({
      locale: 'en',
      caseFirst: 'off'
    }).sort(sort).catch((err) => {
      throw utils.ErrorHelper.serverError(err)
    })
}

module.exports.bulkUpdate = (query, update) => {
  return userModel.update(
    query,
    {$set: update},
    {multi: true})
}

module.exports.filterBy = (query) => {
  const searchQuery = new RegExp(query.filter, 'i')
  return new Promise((resolve, reject) => {
    return userModel.aggregate(
      [
        {
          $project: {
            name: {$concat: ['$firstName', ' ', '$lastName']},
            firstName: true,
            lastName: true,
            _company: true,
            isActive: true
          }
        },
        {
          $match: {
            _company: query._company,
            isActive: true,
            $or: [
              {
                name: searchQuery
              },
              {
                firstName: searchQuery
              },
              {
                lastName: searchQuery
              }
            ]
          }
        },
        {
          $project: {
            _id: true
          }
        }
      ],
      (err, results) => {
        if (err) reject(err)
        return resolve(results)
      }
    )
  }).catch((err) => {
    throw utils.ErrorHelper.serverError(err)
  })
}

module.exports.delete = (query) => {
  return userModel.findOne(query).then((user) => {
    if (!user) {
      return
    }
    user.firstName = 'Deleted'
    user.lastName = 'User'
    user.email = uuid.v4() + '@mobilepractice.io'
    user.avatarId = undefined
    user.isActive = false

    return user.save()
  }).catch((err) => {
    throw utils.ErrorHelper.serverError(err)
  })
}

module.exports.deleteReal = (query) => {
  console.log('query', query)
  return userModel.remove(query).then(() => {
    return true
  }).catch((err) => {
    throw utils.ErrorHelper.serverError(err)
  })
}

module.exports.bulkDelete = (query) => {
  return userModel
    .find(query)
    .then(users => {
      const actions = []
      users.forEach(user => {
        user.isActive = false
        user.firstName = 'Deleted'
        user.lastName = 'User'
        user.email = uuid.v4() + '@mobilepractice.io'
        user.avatarId = undefined
        intercomEmitter.emit('deleteUser', user)
        actions.push(user.save())
      })

      return Promise.all(actions)
    })
}

module.exports.makeUsersInactive = (companyId) => {
  return userModel
    .find({_company: companyId})
    .then(users => {
      const actions = []
      users.forEach(user => {
        user.isActive = false
        user.firstName = 'Deleted'
        user.lastName = 'User'
        user.email = uuid.v4() + '@mobilepractice.io'
        user.avatarId = undefined
        intercomEmitter.emit('deleteUser', user)
        actions.push(user.save())
      })
      return Promise.all(actions)
    }
    )
}

module.exports.edit = (id, data) => {
  let email = ''
  if (data.email) {
    email = data.email.trim()
  }
  return userModel.findOne({_id: {$ne: id}, email: email})
    .then((existingEmail) => {
      if (existingEmail) {
        throw utils.ErrorHelper.badRequest('ERROR_EMAIL_EXIST')
      }
      return userModel.findOne({_id: id, isActive: true})
    })
    .then((user) => {
      if (!user) {
        throw utils.ErrorHelper.badRequest('ERROR_EMAIL_EXIST')
      }
      user.firstName = (data.firstName) ? data.firstName : user.firstName
      user.lastName = (data.lastName) ? data.lastName : user.lastName
      user.email = (data.email) ? data.email : user.email
      user.avatarId = (data.avatarId) ? data.avatarId : user.avatarId
      user.avatarColor = (data.avatarColor)
        ? data.avatarColor
        : user.avatarColor
      user.country = (data.country) ? data.country : user.country
      user.postcode = (data.postcode) ? data.postcode : user.postcode
      user.lang = (data.lang) ? data.lang : user.lang
      user.terms = (typeof data.terms !== 'undefined') ? data.terms : (user.terms || false)
      user.managerCriteria = (typeof data.managerCriteria !== 'undefined') ? data.managerCriteria : (user.managerCriteria || '')
      if (data.isCompanyAdmin !== undefined) {
        user.isCompanyAdmin = data.isCompanyAdmin
        // user.password = null
        if (data.password !== undefined) {
          user.password = data.password
        }
        if (user.isCompanyAdmin && !user.password) {
          throw utils.ErrorHelper.badRequest('ERROR_INVALID_PASSWORD')
        }
      }
      user.extraInformation = (data.extraInformation)
        ? data.extraInformation
        : user.extraInformation
      return user.save()
    })
}

module.exports.removeDeviceToken = (userId, token) => {
  return userModel.update({_id: userId}, {$pull: {devices: {token: token}}}, { multi: true }).then(() => true).catch((e) => console.log(e))
}

module.exports.getAll = () => {
  return userModel
    .find({})
    .populate('_company', {name: true})
}
