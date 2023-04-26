'use strict'

const _config = require('../../../config/config.js')

module.exports.aws = (req, res) => {
  res.json({
    region: _config.aws.region,
    videoBucket: _config.aws.videoBucket,
    photoBucket: _config.aws.photoBucket
  })
}
