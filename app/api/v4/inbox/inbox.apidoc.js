/**
 * @apiVersion 4.0.0
 * @apiDefine InboxDatabaseSchema
 * @apiExample {js} Database Schema
 * {
  inboxId: {type: String, unique: true},
  _user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  _recipient: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  isActive: {type: Boolean, default: true},
  message: {
    _user: {type: Schema.Types.ObjectId, ref: 'User'},
    content: {type: String},
    type: {type: String},
    time: {type: String}
  },
  status: {
    type: String,
    enum: ['read', 'unread'],
    default: 'unread'
  }
 * }
 */

/**
 * @apiVersion 4.0.0
 * @apiDefine FirebaseMessageModel
 * @apiExample {js} Firebase Message Model
 * {
  "_user" : "595df1bc3ff6dd5f64eb167a",
  "content" : "Hello, How you're getting on?",
  "time" : "Thu, 06 Jul 2017 08:40:26 GMT",
  "type" : "text"
 * }
 */

/**
 * @apiVersion 4.0.0
 * @api {post} /company/:companyId/inbox Create inbox
 * @apiName CreateInbox
 * @apiDescription Create inbox for starting chat
 * @apiGroup Inbox
 * @apiHeader {String} Authorization* Access token
 * @apiUse InboxDatabaseSchema
 * @apiParamExample {json} Request-Example:
 *     {
 *       "_recipient": "595a4b12f3f3573e64846300" // ObjectId of user you want to start chat with
 *     }

 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 {
     "inboxId": "https://mobile-practice-staging.firebaseio.com/inboxes/595df1bc3ff6dd5f64eb167a/595a4b12f3f3573e64846300/595df75e3f4f98de23711930",
     "_id": "595df75e3f4f98de23711930",
     "_recipient": {
            "_id": "595a4b12f3f3573e64846300",
            "firstName": "BMW",
            "lastName": "CA",
            "avatarColor": "ffbe42",
            "avatar_sm": null,
            "avatar_md": null,
            "avatar_lg": null,
            "havePassword": false,
            "name": "BMW CA"
        },
      "_user": {
          "_id": "595df1bc3ff6dd5f64eb167a",
          "firstName": "Company",
          "lastName": "Admin",
          "avatarColor": "6c6ced",
          "avatar_sm": null,
          "avatar_md": null,
          "avatar_lg": null,
          "havePassword": false,
          "name": "Company Admin"
      },
     "updatedAt": "2017-07-06T08:39:58.196Z",
     "__v": 0,
     "createdAt": "2017-07-06T08:39:58.131Z",
     "isActive": true
 }
 * @apiErrorExample {json} Bad Request:
 {
   "code": 400,
   "error": "BAD_REQUEST",
   "message": "Recipient is invalid"
 }
 */
/**
 * @apiVersion 4.0.0
 * @api {get} /company/:companyId/inbox/:inboxId Get One inbox
 * @apiName GETOneInbox
 * @apiDescription Get one Inbox
 * @apiGroup Inbox
 * @apiHeader {String} Authorization* Access token
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 {
     "inboxId": "https://mobile-practice-staging.firebaseio.com/inboxes/595df1bc3ff6dd5f64eb167a/595a4b12f3f3573e64846300/595df75e3f4f98de23711930",
     "_id": "595df75e3f4f98de23711930",
     "_recipient": "595a4b12f3f3573e64846300",
     "_user": "595df1bc3ff6dd5f64eb167a",
     "updatedAt": "2017-07-06T08:39:58.196Z",
     "__v": 0,
     "createdAt": "2017-07-06T08:39:58.131Z",
     "isActive": true,
     "status": "read"
 }
 * @apiErrorExample {json} Bad Request:
 {
   "code": 400,
   "error": "BAD_REQUEST",
   "message": "status could be read or unread"
 }
 */
/**
 * @apiVersion 4.0.0
 * @api {patch} /company/:companyId/inbox/:inboxId Update inbox
 * @apiName UpdateInbox
 * @apiDescription Update Inbox
 * @apiGroup Inbox
 * @apiHeader {String} Authorization* Access token
 * @apiParamExample {json} Request-Example:
 *     {
 *       "status": "read",
 *        "lastReadMessage": "firebaseId"
 *     }

 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 {
     "inboxId": "https://mobile-practice-staging.firebaseio.com/inboxes/595df1bc3ff6dd5f64eb167a/595a4b12f3f3573e64846300/595df75e3f4f98de23711930",
     "_id": "595df75e3f4f98de23711930",
     "_recipient": "595a4b12f3f3573e64846300",
     "_user": "595df1bc3ff6dd5f64eb167a",
     "updatedAt": "2017-07-06T08:39:58.196Z",
     "__v": 0,
     "createdAt": "2017-07-06T08:39:58.131Z",
     "isActive": true,
     "status": "read",
     "lastReadMessage": "firebaseId"
 }
 * @apiErrorExample {json} Bad Request:
 {
   "code": 400,
   "error": "BAD_REQUEST",
   "message": "status could be read or unread"
 }
 */

/**
 * @apiVersion 4.0.0
 * @api {patch} /company/:companyId/inbox Bulk delete
 * @apiName BulkDelete
 * @apiDescription Bulk Delete
 * @apiGroup Inbox
 * @apiHeader {String} Authorization* Access token
 * @apiParamExample {json} Request-Example:
 *     [{
 *       "_id": "d3e123eqwe12123qwq12", isActive: false
 *     }]

 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 204 No content
 * @apiErrorExample {json} Bad Request:
 {
   "code": 400,
   "error": "BAD_REQUEST",
   "message": "status could be read or unread"
 }
 */

/**
 * @apiVersion 4.0.0
 * @api {delete} /company/:companyId/inbox/:inboxId Delete inbox
 * @apiName DeleteInbox
 * @apiDescription delete inbox
 * @apiGroup Inbox
 * @apiHeader {String} Authorization* Access token

 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 204 No content

 * @apiErrorExample {json} FORBIDDEN:
 {
   "code": 403,
   "error": "FORBIDDEN",
   "message": "FORBIDDEN"
 }
 */

/**
 * @apiVersion 4.0.0
 * @api {get} /company/:companyId/inbox Get list of inboxes
 * @apiName GetInbox
 * @apiDescription Get list of inboxes
 * @apiGroup Inbox
 * @apiHeader {String} Authorization* Access token
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 [{
     "inboxId": "inboxes/595df1bc3ff6dd5f64eb167a/595a4b12f3f3573e64846300/595df75e3f4f98de23711930",
     "_id": "595df75e3f4f98de23711930",
     "_recipient": {
            "_id": "595a4b12f3f3573e64846300",
            "firstName": "BMW",
            "lastName": "CA",
            "avatarColor": "ffbe42",
            "avatar_sm": null,
            "avatar_md": null,
            "avatar_lg": null,
            "havePassword": false,
            "name": "BMW CA"
        },
        "_user": {
            "_id": "595df1bc3ff6dd5f64eb167a",
            "firstName": "Company",
            "lastName": "Admin",
            "avatarColor": "6c6ced",
            "avatar_sm": null,
            "avatar_md": null,
            "avatar_lg": null,
            "havePassword": false,
            "name": "Company Admin"
        },
     "updatedAt": "2017-07-06T08:39:58.196Z",
     "__v": 0,
     "createdAt": "2017-07-06T08:39:58.131Z",
     "isActive": true,
     "lastReadMessage": "firebaseKey",
     "unreadMessagesCount": 3,
     "message": {
        "_user" : "595df1bc3ff6dd5f64eb167a",
        "content" : "Hello, How you're getting on?",
        "time" : "Thu, 06 Jul 2017 08:40:26 GMT",
        "type": "text"
      }
 }]
 * @apiParam (Practice response field) {String="notStarted", "inProgress", "waitingOnFeedback", "completed"} state* (only for coach) practice chat category
 * @apiErrorExample {json} FORBIDDEN:
 {
   "code": 403,
   "error": "FORBIDDEN",
   "message": "FORBIDDEN"
 }
 */

/**
 * @apiVersion 4.0.0
 * @api {post} /company/:companyId/inbox/:inboxId Send inbox message
 * @apiName SendInboxMessage
 * @apiDescription Send Inbox Message
 * @apiGroup Inbox
 * @apiHeader {String} Authorization* Access token
 * @apiUse FirebaseMessageModel
* @apiParamExample {json} Request-Example (Text):
 *     {
 *       "content": "Hello, How you're getting on?"
 *     }
 *
 * @apiParamExample {json} Request-Example (Image):
 *     {
 *        "content": {
 *           "imageId": "089b4188-3855-433c-9c2d-c0904c5addf6",
 *           "imageName": "089b4188-3855-433c-9c2d-c0904c5addf6.jpg",
 *           "text": "optional field"
 *         },
 *         "type": "image"
 *     }
 *
 * @apiParamExample {json} Request-Example (Video):
 *     {
 *        "content": {
 *           "videoId": "089b4188-3855-433c-9c2d-c0904c5addf6",
 *           "duration": 123445,
 *           "size": 122344,
 *           "videoOrientation": "portrait" // "landscape",
 *           "text": "optional field"
 *         },
 *         "type": "video"
 *     }
 *
 * @apiParamExample {json} Request-Example (File):
 *     {
 *        "content": {
 *           "fileId": "089b4188-3855-433c-9c2d-c0904c5addf6",
 *           "fileName": "089b4188-3855-433c-9c2d-c0904c5addf6.csv",
 *           "originalName": "name.csv",
 *           "size": 12244,
 *           "text": "optional field"
 *         },
 *         "type": "file"
 *     }
 * @apiParamExample {json} Request-Example (Audio):
 *     {
 *        "content": {
 *           "audioId": "089b4188-3855-433c-9c2d-c0904c5addf6",
 *           "size": 12345,
 *           "text": "optional field"
 *         },
 *         "type": "audio"
 *     }
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * @apiErrorExample {json} Bad Request:
 {
   "code": 400,
   "error": "BAD_REQUEST",
   "message": "Recipient is invalid"
 }
 */
