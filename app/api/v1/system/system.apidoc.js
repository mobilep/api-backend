'use strict'
/**
 * @apiVersion 1.0.0
 * @api {get} /system/aws Get aws info
 * @apiName getAws
 * @apiDescription  Get aws info
 * @apiGroup System
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 {
    "region": "********",
    "photoBucket": "********", // only for .jpg files
    "videoBucket": "********" // only for .mp4 files
 }
 **/
