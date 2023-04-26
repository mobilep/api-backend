'use strict'

const helperCompany = require('./company.helper.js')
const daoUser = require('../user/user.dao')
const daoTeam = require('../team/team.dao')
const Promise = require('bluebird')
const _ = require('lodash')

class UsersImporter {
  constructor (importData, _company) {
    this.importData = importData
    this._company = _company
    this.processedUsers = []
    this.cache = {}
  }

  async doImport () {
    await this.validateAndSaveAll()
    await this.resolveTeams()
    await this.insertUsersInTeams()
    return this.prepareResult()
  }

  prepareResult () {
    const addedUsers = []
    const failedUsers = []
    const issues = []
    this.processedUsers.forEach((data) => {
      if (data._id && data.issues.length === 0) return addedUsers.push(data)
      if (data._id && data.issues.length > 0) return issues.push(data)
      failedUsers.push(data)
    })
    return {addedUsers, failedUsers, issues}
  }

  async insertUsersInTeams () {
    this.processedUsers = await Promise.map(this.processedUsers, (data) => {
      if (!data._id || !data._team) return data
      return daoTeam.insertUser(data._team, data._id)
        .then(() => data)
        .catch(() => {
          data.issues.push('importUnableInsertInTeam')
          return data
        })
    }, {concurrency: 20})
  }

  async resolveTeams () {
    const max = this.processedUsers.length
    for (let i = 0; i < max; i++) {
      const data = this.processedUsers[i]
      if (!data._id || !data.teamName || !data.coachEmail) continue
      let _coach = this.cache[data.coachEmail]
      if (!_coach) {
        const coach = await daoUser.getByEmailAndCompany(data.coachEmail, this._company)
        if (!coach) {
          data.issues.push('importNoCoach')
          continue
        }
        _coach = coach._id
        this.cache[coach.email] = _coach
      }
      let _team = this.cache[`${data.coachEmail}-${data.teamName}`]
      if (!_team) {
        let team = await daoTeam.getByNameCompanyCoach(data.teamName, this._company, _coach)
        if (!team) {
          team = await daoTeam.create({
            name: data.teamName,
            _company: this._company,
            _owner: _coach
          }, true)
        }
        _team = team._id
        this.cache[`${data.coachEmail}-${data.teamName}`] = _team
      }
      data._team = _team
    }
  }

  async validateAndSaveAll () {
    this.processedUsers = await Promise.map(this.importData, (data, index) => {
      let validUserObject
      let result = {
        _id: null,
        _team: null,
        lineNumber: index + 1,
        email: '',
        coachEmail: '',
        teamName: '',
        failReason: '',
        issues: []
      }
      try {
        const userObject = helperCompany.getImportedUserObject(data)
        validUserObject = helperCompany.validateImportUserMainFields(userObject)
        result.email = validUserObject.email
      } catch (error) {
        result.failReason = 'importInvalidLine'
        return result
      }
      return this.addUser(validUserObject)
        .then((addedUser) => {
          this.cache[addedUser.email] = addedUser._id
          result._id = addedUser._id
          try {
            validUserObject = helperCompany.validateImportUserTeamFields(validUserObject)
            result.coachEmail = validUserObject.coach
            result.teamName = validUserObject.team
          } catch (e) {
            result.issues.push('importInvalidTeamInput')
          }
          return result
        })
        .catch((error) => {
          if (error && error.message === 'ERROR_EMAIL_EXIST') {
            result.failReason = 'importAlreadyExists'
          } else {
            result.failReason = 'importUnknownError'
          }
          return result
        })
    }, {concurrency: 20})
  }

  addUser (user) {
    user._company = this._company
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
    return daoUser.create(user)
  }
}

module.exports = UsersImporter
