'use strict'

const crypto = require('crypto')
const axios = require('axios')
const _ = require('lodash')

const daoUser = require('../user/user.dao')
const daoScenario = require('../scenario/scenario.dao')
const companyDao = require('../company/company.dao')
const serviceScenario = require('../scenario/scenario.service')
const integrationService = require('../tom-integrations/tom-integration.service')

const _config = require('./../../../config/config.js')

class TeachonmarsClient {
  constructor (data = null) {
    let conf = _config.tom
    if (data) {
      conf.apiKey = data.apiKey
      conf.apiSecret = data.apiSecret
      conf.appName = data.name
      conf.api = data.link
    }

    this.key = conf.apiKey
    this.secret = conf.apiSecret
    this.app = conf.appName
    this.api = conf.api
  }
  async validateToken (learnerId, identityToken) {
    try {
      // BODY
      const body = {
        'learnerId': learnerId,
        'token': identityToken
      }

      // HEADERS
      const headers = {}
      headers['X-TOM-API-KEY'] = this.key
      headers['X-TOM-APP'] = this.app
      headers['X-TOM-NONCE'] = 'test-staging' + Date.now()
      headers['X-TOM-RTS'] = Math.floor(Date.now() / 1000)
      const requestUrl = this.api + '/verifyIdentityToken'
      const REQUEST_HASH = crypto.createHash('md5').update(JSON.stringify(body) + requestUrl).digest('hex')
      headers['X-TOM-API-HASH'] = crypto.createHash('sha256').update(this.secret + headers['X-TOM-RTS'] + headers['X-TOM-APP'] + REQUEST_HASH + headers['X-TOM-NONCE']).digest('hex')

      console.log('\nBODY', body)
      console.log('\nHEADERS', headers)

      const getUserData = await axios({
        url: requestUrl,
        method: 'post',
        data: body,
        headers: headers
      }).catch((Error, res) => {
        console.log(Error.response)
      })

      if (!_.get(getUserData, 'data.response.authToken')) {
        throw new Error('INVALID_IDENTITY_TOKEN')
      }
    } catch (e) {
      throw e
    }
  }

  async getLearnerEmail (learnerId) {
    try {
      const headers = {}
      headers['X-TOM-API-KEY'] = this.key
      headers['X-TOM-APP'] = this.app
      headers['X-TOM-NONCE'] = 'mp-api-' + Date.now() * Math.random()
      headers['X-TOM-RTS'] = Math.floor(Date.now() / 1000)
      const requestUrl = this.api + '/learner/' + learnerId
      const REQUEST_HASH = crypto.createHash('md5').update(requestUrl).digest('hex')
      headers['X-TOM-API-HASH'] = crypto.createHash('sha256').update(this.secret + headers['X-TOM-RTS'] + headers['X-TOM-APP'] + REQUEST_HASH + headers['X-TOM-NONCE']).digest('hex')
      // headers['X-TOM-AUTH-TOKEN'] = getUserData.data.response.authToken

      const getUserData = await axios({
        url: requestUrl,
        method: 'get',
        headers: headers
      }).catch((Error, res) => {
        console.log(Error.response)
      })

      return getUserData.data.response.email
    } catch (e) {
      throw new Error(e.message)
    }
  }
}

const intercomEmitter = require('../intercom/IntercomEmitter')

const admin = require('firebase-admin')
/**
 * support login /sso?accessToken='...'&fbtoken='...'&nextUrl='/scenarios/:scenarioId'
 * @param req
 * @param res
 * @param next
 * @returns {Promise<unknown>}
 */
module.exports.autoSignIn = async (req, res, next) => {
  try {
    const learnerId = req.query.learnerId
    const token = req.query.token
    const scenarioId = req.query.scenarioId
    const companyId = req.query.companyId

    let params = null
    const credentials = await integrationService.getCredentials(companyId)
    const company = await companyDao.getById(companyId)

    if (credentials && company.integration) {
      params = Object.assign({}, company.integration.toJSON(), credentials)
    }
    if (!params) {
      throw utils.ErrorHelper.badRequest('COMPANY_DOES_NOT_HAVE_INTEGRATION')
    }

    const tomClient = new TeachonmarsClient(params)
    await tomClient.validateToken(learnerId, token)
    const userEmail = await tomClient.getLearnerEmail(learnerId)

    let user = await daoUser.getByEmail(userEmail)
    if (!user) throw utils.ErrorHelper.badRequest('ERROR_INVALID_USER')

    if (!user._company) {
      if (req.body.webForm !== true) {
        throw utils.ErrorHelper.forbidden('ERROR_ACCESS_DENIED')
      }
    }
    if (!user.firstLogIn) {
      user.firstLogIn = new Date()
      await user.save()
    }
    user = user.toJSON()
    user.accessToken = utils.Passport.createAuthToken(user)
    user.fbtoken = await admin.auth().createCustomToken(user._id.toString())
    intercomEmitter.emit('user-sign-in', {email: user.email})

    let redirectUrl = `${_config.webClient}/sso?accessToken=${user.accessToken}&fbtoken=${user.fbtoken}&nextUrl=/scenarios`
    if (scenarioId) {
      const userInScenario = await daoScenario.getOne({$or: [{_id: scenarioId, _users: user._id}, {_id: scenarioId, _coach: user._id}]})
      const scenario = await daoScenario.getOne({_id: scenarioId})
      if (!scenario) {
        throw utils.ErrorHelper.badRequest('ERROR_INVALID_SCENARIO')
      }
      if (!userInScenario) {
        scenario._users.push(user._id)
        await serviceScenario.enrolUser(scenario, user)
      }

      redirectUrl += `/${scenarioId}`
    }

    res.redirect(redirectUrl)
  } catch (e) {
    console.log('err', e)
    return next(e)
  }
}
