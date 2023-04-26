'use strict'

const scenarioModel = require('../../../models/scenario.model')
const daoPractice = require('./../practice/practice.dao')

module.exports.create = (data) => {
  return scenarioModel.create(data)
    .then((data) => {
      return scenarioModel.findOne({_id: data._id})
        .populate({
          path: '_users _coach',
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
            sort: {lastName: 1}
          }
        }).populate('_criterias')
    })
}

module.exports.getById = (id) => {
  return scenarioModel.findOne({_id: id, isActive: true})
    .populate({
      path: '_users _coach',
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
        sort: {lastName: 1}
      }
    }).populate('_criterias')
    .catch((err) => {
      throw utils.ErrorHelper.serverError(err)
    })
}

module.exports.getByIdSimple = (id) => {
  return scenarioModel.findOne({_id: id, isActive: true})
    .lean()
    .catch((err) => {
      throw utils.ErrorHelper.serverError(err)
    })
}

module.exports.update = (id, data) => {
  return scenarioModel.findByIdAndUpdate(id, {$set: data}, {new: true})
    .populate({
      path: '_users _coach',
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
        sort: {lastName: 1}
      }
    }).populate('_criterias')
    .then((updated) => {
      return updated
    })
    .catch((err) => {
      throw utils.ErrorHelper.serverError(err)
    })
}

module.exports.pushBestPractice = (id, data) => {
  return scenarioModel.findByIdAndUpdate(id, {$push: {examples: data}},
    {new: true})
    .populate({
      path: '_users _coach',
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
        sort: {lastName: 1}
      }
    }).populate('_criterias')
    .then((updated) => {
      return updated
    })
    .catch((err) => {
      throw utils.ErrorHelper.serverError(err)
    })
}

module.exports.bulkDelete = (query) => {
  return scenarioModel.find(query).then((scenarios) => {
    if (scenarios.length === 0) {
      return
    }
    const promises = []
    scenarios.forEach((scenario) => {
      scenario.isActive = false
      promises.push(scenario.save())
      promises.push(daoPractice.delete({_scenario: scenario._id}))
    })
    return Promise.all(promises)
  }).catch((err) => {
    throw utils.ErrorHelper.serverError(err)
  })
}

module.exports.bulkDeleteReal = (query) => {
  return scenarioModel.remove(query)
}

module.exports.delete = (query) => {
  return scenarioModel.findOne(query).then((scenario) => {
    if (!scenario) {
      return
    }
    scenario.isActive = false
    return scenario.save()
  }).then((scenario) => {
    return daoPractice.delete({_scenario: scenario._id})
  }).catch((err) => {
    throw utils.ErrorHelper.serverError(err)
  })
}

module.exports.getJSON = (query) => {
  const params = {
    $or: [
      {_coach: query.reqUser},
      {_users: query.reqUser, type: {$in: ['complete', 'current']}}
    ],
    isActive: true
  }
  // params._coach = query.reqUser
  if (query._company) {
    params._company = query._company
  }

  return scenarioModel.find(params).populate({
    path: '_users _coach',
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
      sort: {lastName: 1}
    }
  }).populate('_criterias').sort({
    updatedAt: -1
  }).then((scenarios) => {
    const scenariosWithPractices = []
    if (!scenarios) {
      return []
    }
    scenarios.forEach((scenario) => {
      if (!scenario._coach) return
      if (scenario._coach._id.equals(query.reqUser)) {
        // user is coach
        let practices = daoPractice.get({
          _user: query.reqUser,
          isActive: true,
          _scenario: scenario._id
        })
        scenariosWithPractices.push(
          Promise.all([scenario, practices])
        )
      } else {
        // user is learner
        let practice = daoPractice.getOne({
          isActive: true,
          _scenario: scenario._id,
          _user: query.reqUser,
          _coach: scenario._coach._id
        })
        scenariosWithPractices.push(
          Promise.all([scenario, practice])
        )
      }
    })
    return Promise.all(scenariosWithPractices)
  })
    .then((scenariosWithPractices) => {
      if (!scenariosWithPractices) {
        return []
      }
      const scenarios = []
      scenariosWithPractices.forEach((scenarioWithPractice) => {
        scenarioWithPractice[0] = scenarioWithPractice[0].toJSON()
        if (Array.isArray(scenarioWithPractice) &&
          !Array.isArray(scenarioWithPractice[1])) { // learner
          if (scenarioWithPractice[1]) {
            scenarioWithPractice[0].practiceStatus = {
              messages: 0
            }
            if (scenarioWithPractice[1]._inbox.status === 'unread') {
              scenarioWithPractice[0].practiceStatus.messages++
            }
            // scenarioWithPractice[0].type = scenarioWithPractice[1].status
            // scenario completed if practice has userMark
            if (scenarioWithPractice[1].userMark.length > 0) {
              scenarioWithPractice[0].type = scenarioWithPractice[1].status
            } else {
              scenarioWithPractice[0].type = 'current'
            }

            const d1 = new Date(scenarioWithPractice[0].updatedAt)
            const d2 = new Date(scenarioWithPractice[1].updatedAt)

            if (d1 < d2) {
              scenarioWithPractice[0].updatedAt = scenarioWithPractice[1].updatedAt
            }
            scenarios.push(scenarioWithPractice[0])
          }
        } else { // coach
          scenarioWithPractice[0].practiceStatus = {
            evaluated: 0,
            messages: 0
          }
          const practices = scenarioWithPractice[1]

          practices.forEach((practice) => {
            if (practice.status === 'complete') {
              scenarioWithPractice[0].practiceStatus.evaluated++
            }
            if (practice._inbox.status === 'unread') {
              scenarioWithPractice[0].practiceStatus.messages++
            }

            let d1 = new Date(scenarioWithPractice[0].updatedAt)
            let d2 = new Date(practice.updatedAt)

            if (d1 < d2) {
              scenarioWithPractice[0].updatedAt = practice.updatedAt
            }
          })
          scenarios.push(scenarioWithPractice[0])
        }
      })

      return scenarios
    })
    .then((scenarios) => {
      return scenarios.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    })
    .catch((err) => {
      throw utils.ErrorHelper.serverError(err)
    })
}

module.exports.getByCompany = (id) => {
  return scenarioModel
    .find({_company: id})
}

module.exports.getIdsByCompany = (id) => {
  return scenarioModel.find({
    _company: id,
    _id: {$nin: ['574e3a50616165b0b8b55111', '574e3a50616165b0b8b55222']}
  }, '_id')
}

module.exports.addUserToDemoScenario = (scenarioId, userId) => {
  return scenarioModel.findByIdAndUpdate(
    scenarioId,
    {$push: {_users: userId}},
    {new: true}).catch((e) => {
    console.log(e)
  })
}

module.exports.getByCoachList = (coachList) => {
  return scenarioModel.find({_coach: {$in: coachList}, isActive: true}, '_coach _id name isActive type').lean()
    .populate({path: '_coach',
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
        sort: {lastName: 1}
      }
    })
    .catch((e) => {
      console.log(e)
    })
}

module.exports.getAdminScenario = companyId => {
  return scenarioModel.find({_company: companyId, isActive: true}, '_coach _id name isActive type').lean()
    .populate({path: '_coach',
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
        sort: {lastName: 1}
      }
    })
    .catch((e) => {
      console.log(e)
    })
}

module.exports.getAdminScenarioDetails = scenarioId => {
  return scenarioModel.findOne({_id: scenarioId})
    .populate('_company', 'name')
    .populate('_criterias')
    .populate({path: '_users _coach',
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
        sort: {lastName: 1}
      }
    })
    .catch((e) => {
      console.log(e)
    })
}
