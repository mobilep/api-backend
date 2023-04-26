'use strict'

const _config = require('../../../config/config.js')

module.exports.aws = (req, res) => {
  res.json({
    region: _config.aws.region,
    videoBucket: _config.aws.videoBucket,
    photoBucketAvarars: _config.aws.photoBucket,
    photoBucketInbox: _config.aws.inboxPhotoBucket,
    fileBucket: _config.aws.fileBucket,
    audioBucket: _config.aws.audioBucket
  })
}
