'use strict'
const express = require('express')
const _config = require('./../config/config.js')

const router = express.Router()

router.get('/', (req, res) => {
  res.sendStatus(200)
})

router.get(['/.well-known/apple-app-site-association', '/apple-app-site-association'], (req, res) => {
  const dataForApple = _config.appleAppSiteAssociation || {}
  console.log('dataForApple', dataForApple)
  res.json(dataForApple)
})

router.get('/.well-known/assetlinks.json', (req, res) => {
  const dataForAndroid = _config.androidAssetLinks || []
  console.log('dataForAndroid', dataForAndroid)
  res.json(dataForAndroid)
})
module.exports = router
