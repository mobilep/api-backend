'use strict'

const modelTeam = require('../../../models/team.model')

module.exports.create = (data, noPopulate) => {
  data.name = data.name.trim()
  return modelTeam.findOne({ name: data.name, _company: data._company, _owner: data._owner, isActive: true }, {lean: true})
    .then((existingName) => {
      if (existingName) {
        throw utils.ErrorHelper.badRequest('ERROR_TEAM_EXIST')
      }
      if (noPopulate) {
        return modelTeam.create(data)
      }
      return modelTeam.create(data).then((data) => {
        return modelTeam.findOne({_id: data._id})
          .populate({
            path: '_users',
            // model: 'User',
            match: {isActive: true},
            select: {
              _id: true,
              firstName: true,
              lastName: true,
              avatarId: true,
              avatarColor: true,
              devices: true,
              lang: true
            },
            options: {
              sort: {lastName: 1, firstName: 1}
            }
          })
      })
    })
    .then((data) => {
      return data
    })
}

module.exports.edit = (id, data) => {
  let name = ''
  if (data.name) {
    name = data.name.trim()
  }
  const q = {
    _id: {$ne: id},
    _owner: data._owner,
    _company: data._company,
    name: name,
    isActive: true
  }
  return modelTeam.findOne(q)
    .then((existingName) => {
      if (existingName) {
        throw utils.ErrorHelper.badRequest('ERROR_TEAM_EXIST')
      }
      return modelTeam.findOne({
        _id: id,
        _owner: data._owner,
        _company: data._company,
        isActive: true
      })
    })
    .then((team) => {
      if (!team) {
        throw utils.ErrorHelper.badRequest('ERROR_INVALID_TEAM')
      }

      team.name = (data.name) ? data.name : team.name
      team._users = (data._users) ? data._users : team._users
      return team.save()
    })
}

module.exports.editV2 = (id, data) => {
  let name = ''
  if (data.name) {
    name = data.name.trim()
  }
  const q = {
    _id: {$ne: id},
    _owner: data._owner,
    _company: data._company,
    name: name,
    isActive: true
  }
  return modelTeam.findOne(q)
    .then((existingName) => {
      if (existingName) {
        throw utils.ErrorHelper.badRequest('ERROR_TEAM_EXIST')
      }
      return modelTeam.findOne({
        _id: id,
        _owner: data._owner,
        _company: data._company,
        isActive: true
      })
    })
    .then((team) => {
      if (!team) {
        throw utils.ErrorHelper.badRequest('ERROR_INVALID_TEAM')
      }

      team.name = (data.name) ? data.name : team.name
      team._users = (data._users) ? data._users : team._users
      return team.save().then(() => {
        return modelTeam.findOne({
          _id: id
        }).populate({
          path: '_owner _users',
          select: {
            firstName: true,
            lastName: true,
            email: true,
            avatarId: true,
            avatarColor: true
          }
        })
      })
    })
}

module.exports.findByCompany = (params) => {
  const q = {
    _company: params._company,
    _owner: params._owner,
    isActive: true
  }
  return modelTeam.find(q)
    .collation({
      locale: 'en',
      numericOrdering: true,
      caseFirst: 'off'
    })
    .sort({
      name: 1
    })
    .populate({
      path: '_users',
      // model: 'User',
      match: {isActive: true},
      select: {
        _id: true,
        firstName: true,
        lastName: true,
        avatarId: true,
        avatarColor: true,
        devices: true,
        lang: true
      },
      options: {
        sort: {lastName: 1, firstName: 1}
      }
    })
    .then((teams) => {
      return teams
    })
    .catch((err) => {
      throw utils.ErrorHelper.serverError(err)
    })
}

module.exports.getById = (id) => {
  return modelTeam.findOne({_id: id})
    .populate({
      path: '_users',
      // model: 'User',
      match: {isActive: true},
      select: {
        _id: true,
        firstName: true,
        lastName: true,
        avatarId: true,
        avatarColor: true,
        devices: true,
        lang: true
      },
      options: {
        sort: {lastName: 1, firstName: 1}
      }
    })
    .sort({name: 1})
    .then((teams) => {
      return teams
    })
    .catch((err) => {
      throw utils.ErrorHelper.serverError(err)
    })
}

module.exports.getOne = (params) => {
  const q = {
    _id: params._id,
    _company: params._company,
    _owner: params._owner,
    isActive: true
  }
  return modelTeam.findOne(q)
    .populate({
      path: '_users',
      // model: 'User',
      match: {isActive: true},
      select: {
        _id: true,
        firstName: true,
        lastName: true,
        avatarId: true,
        avatarColor: true,
        devices: true,
        lang: true
      },
      options: {
        sort: {lastName: 1, firstName: 1}
      }
    })
    .then((teams) => {
      return teams
    })
    .catch((err) => {
      throw utils.ErrorHelper.serverError(err)
    })
}

module.exports.getByNameCompanyCoach = (name, _company, _owner) => {
  name = name.trim()
  return modelTeam.findOne({ name, _company, _owner }, {lean: true}).catch((err) => {
    throw utils.ErrorHelper.serverError(err)
  })
}

module.exports.insertUser = (id, _user) => {
  return modelTeam.update({_id: id}, {
    $push: {_users: _user}
  }).catch((err) => {
    throw utils.ErrorHelper.serverError(err)
  })
}

module.exports.delete = (query) => {
  return modelTeam.findOne(query).then((team) => {
    if (!team) {
      return
    }
    team.isActive = false
    return team.save()
  }).catch((err) => {
    throw utils.ErrorHelper.serverError(err)
  })
}

module.exports.getDefault = (params) => {
  return modelTeam.findOne({ ...params, isDefault: true, isActive: true })
    .populate({
      path: '_users _owner',
      match: {isActive: true},
      select: {
        _id: true,
        firstName: true,
        lastName: true,
        lang: true,
        email: true
      },
      options: {
        sort: {lastName: 1, firstName: 1}
      }
    })
    .catch((err) => {
      throw utils.ErrorHelper.serverError(err)
    })
}

module.exports.deleteMany = (query) => {
  return modelTeam.updateMany(query, {isActive: false})
}

module.exports.getTeams = (query) => {
  return modelTeam.find({...query, isActive: true})
}

module.exports.getTeamsWithActiveUsers = (query) => {
  return modelTeam.aggregate()
    .match({...query, isActive: true})
    .lookup({
      from: 'users',
      localField: '_users',
      foreignField: '_id',
      as: '_users'
    })
    .unwind('_users')
    .addFields({
      '_owner': {$toString: '$_owner'},
      '_users._id': {$toString: '$_users._id'}
    })
    .match({'_users.isActive': true})//, '_owner': {$ne: '$_users._id'}})
    .project({
      isLearner: {$ne: ['$_owner', '$_users._id']},
      _owner: '$_owner',
      _users: '$_users'
    })
    .match({isLearner: true})
    .group({
      _id: '$_id',
      _owner: {$first: '$_owner'}
    })
}
