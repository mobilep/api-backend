'use strict'

const companyDao = require('../company/company.dao')
const service = require('./tom-integration.service')
const helper = require('./tom-integration.helper')

/** GET */
module.exports.getCompanyIntegrationInfo = async (req, res, next) => {
  try {
    const companyId = req.params.companyId
    const company = await companyDao.getById(companyId)
    const creds = await service.getCredentials(companyId)

    let data = null
    if (creds && company.integration) {
      data = Object.assign({}, company.integration.toJSON(), creds)

      return res.json({ data })
    }

    return res.status(404).send()
  } catch (err) {
    console.log('[ERR] getCompanyIntegrationInfo', err)
    return next(err)
  }
}

/** POST */
module.exports.addIntegrationToCompany = async (req, res, next) => {
  try {
    const companyId = req.params.companyId
    const input = helper.validateCreateIntegration(req.body)
    const company = await companyDao.getById(companyId)

    company.integration = {
      name: input.name,
      link: input.link
    }

    await company.save()
    await service.upsertCredentialsIntoSecretManager(companyId, {
      apiKey: input.apiKey,
      apiSecret: input.apiSecret
    })

    return res.json({
      status: 'created'
    })
  } catch (err) {
    console.log('[ERR] addIntegrationToCompany', err)
    return next(err)
  }
}

/** PATCH */
module.exports.updateCompanyIntegration = async (req, res, next) => {
  try {
    const companyId = req.params.companyId
    const input = helper.validateCreateIntegration(req.body)
    const company = await companyDao.getById(companyId)

    company.integration.name = input.name
    company.integration.link = input.link

    await company.save()
    await service.upsertCredentialsIntoSecretManager(companyId, {
      apiKey: input.apiKey,
      apiSecret: input.apiSecret
    })

    return res.json({
      status: 'updated'
    })
  } catch (err) {
    console.log('[ERR] updateCompanyIntegration', err)
    return next(err)
  }
}

/** DELETE */
module.exports.deleteCompanyIntegration = async (req, res, next) => {
  try {
    const companyId = req.params.companyId
    const company = await companyDao.getById(companyId)

    company.integration = null

    await company.save()
    const deleted = await service.removeCredentials(companyId)

    if (!deleted) {
      return res.status(404).send()
    }

    return res.json({
      status: 'deleted'
    })
  } catch (err) {
    console.log('[ERR] deleteCompanyIntegration', err)
    return next(err)
  }
}
