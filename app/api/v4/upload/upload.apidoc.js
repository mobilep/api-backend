'use strict'
/**
 * @apiVersion 4.0.0
 * @api {post} /upload Upload one media file (photo/video/file/audio)
 * @apiName FileUpload
 * @apiDescription Upload one media file (photo/video/file/audio)
 * @apiGroup Upload
 * @apiHeader {String} Authorization* Access token
 *
 * @apiParam (Body parameters) {String} filename* file name
 * @apiParam (Body parameters) {String="image/(jpg)", "video/...", "file/...", "audio/..."} ContentType* file type and extension
 * @apiParam (Body parameters) {String="photo", "avatar"} category* (only for images) image category
 * @apiParamExample {json} Request-Example (Video):
 *     {
 *        "filename": "video.mp4",
 *        "ContentType": "video/mp4"
 *      }
 * @apiParamExample {json} Request-Example (Image):
 *     {
 *        "filename": "image.jpg",
 *        "ContentType": "image/jpg",
 *        "category": "photo"
 *      }
 * @apiParamExample {json} Request-Example (File):
 *     {
 *        "filename": "file.pdf",
 *        "ContentType": "application/pdf"
 *      }
 * @apiParamExample {json} Request-Example (Audio):
 *     {
 *        "filename": "audio.mp3",
 *        "ContentType": "audio/mp3"
 *      }
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 {
   "fileID": "a4f0723a-1c4b-438a-a429-58bde254ae50",
   "name": "a4f0723a-1c4b-438a-a429-58bde254ae50.avi",
   "url": "string"
 }
 * @apiErrorExample {json} Bad Request:
 {
   "code": 400,
   "error": "BAD_REQUEST",
   "message": "BAD_REQUEST"
 }
 */

// -----------------------------------------------------------------
