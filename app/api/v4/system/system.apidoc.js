'use strict'
/**
 * @apiVersion 4.0.0
 * @api {get} /system/aws Get aws info
 * @apiName getAws
 * @apiDescription  Get aws info
 * @apiGroup System
 * @apiHeader {String} Authorization* Access token
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 {
    "region": "********",
    "videoBucket": "********" // only for .mp4 files
    "photoBucketAvarars": "********", // only for .jpg files
    "photoBucketInbox": "********",
    "fileBucket": "********",
    "audioBucket": "********",
 }
 **/
