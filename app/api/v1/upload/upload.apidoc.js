'use strict'
/**
 * @apiVersion 1.0.0
 * @api {post} /upload Upload one media file (photo/video)
 * @apiName FileUpload
 * @apiDescription Upload one media file (photo/video)
 * @apiGroup Upload

 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 {
   "fileID": "a4f0723a-1c4b-438a-a429-58bde254ae50"
 }
 * @apiErrorExample {json} Bad Request:
 {
   "code": 400,
   "error": "BAD_REQUEST",
   "message": "BAD_REQUEST"
 }
 */

// -----------------------------------------------------------------

/**
 * @apiVersion 1.0.0
 * @api {post} /multyupload Upload few media files (photos/videos), max 5
 * @apiName MultyFileUpload
 * @apiDescription Upload few media files (photos/videos), max 5
 * @apiGroup Upload

 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 {
    "files": [
      {
        "fileID": "c91315bf-2b3f-4287-9930-6be27350942e",
        "file": "9636a19d-3186-472d-9ebb-b76fa06d2c03.jpg",
        "type": "image/jpeg"
      },
      {
        "fileID": "5cc5a7d8-5c50-4d76-aa94-c21e7094274d",
        "file": "1526556802320.JPEG.jpg",
        "type": "image/jpeg"
      }
    ]
}
 * @apiErrorExample {json} Bad Request:
 {
   "code": 400,
   "error": "BAD_REQUEST",
   "message": "BAD_REQUEST"
 }
 */

// -----------------------------------------------------------------
