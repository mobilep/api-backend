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

/*********************************************************************
 * @apiVersion 4.0.0
 * @api {post} /company/:companyId/chat Create private chat
 * @apiName CreatePrivateChat
 * @apiDescription Create private chat
 * @apiGroup Chat
 * @apiHeader {String} Authorization* Access token
 * @apiParam (Body parameters) {Array} recipients* ids of people who will be added to chat
 * @apiParam (Body parameters) {String} title* chat name

 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
* {
        "_id": "5daef3586ce3c76d383e5cc2",
        "updatedAt": "2019-11-01T15:52:19.296Z",
        "createdAt": "2019-10-22T12:17:28.596Z",
        "_moderator": {},
        "title": "Name"
        "__v": 0,
        "chatId": "mpchat/5daef3586ce3c76d383e5cc2",
        "messagesCount": 1,
        "type": "practice",
        "message": {
            "time": "1572507052452",
            "content": "Andrew is the first to start practicing the scenario",
            "_user": "5d5e61c041efb46d8fe45a09",
            "type": "system-text",
            "firebaseKey": "-LsViL_D7EboDy5Qe0ak"
        },
        "firstResponseAt": null,
        "firstMessageAt": null,
        "isActive": true,
        "users": [...],
        "unreadMessagesCount": 0,
        "lastReadMessage": "",
        "status": "unread"
}

 * @apiErrorExample {json} Bad Request:
 {
   "code": 400,
   "error": "BAD_REQUEST",
   "message": "ERROR_INVALID_OBJECT_ID"
 }
*/

/*********************************************************************
* @apiVersion 4.0.0
* @api {get} /company/:companyId/chat List of chats
* @apiName ChatList
* @apiDescription Get list of chats
* @apiGroup Chat
* @apiHeader {String} Authorization* Access token
* @apiSuccessExample {json} Success-Response:
* HTTP/1.1 200 OK
* [
   {
        "_id": "5daef3586ce3c76d383e5cc2",
        "updatedAt": "2019-11-01T15:52:19.296Z",
        "createdAt": "2019-10-22T12:17:28.596Z",
        "_moderator": {},
        "_scenario": {
             "_id": "5daefb126ce3c76d383e5ccd",
            "videoId": "id",
            "groupChat": "https://mobile-practice-dev.firebaseio.com/mpchat/5daefb126ce3c76d383e5cce",
            "name": "Titanik",
            "video": {
                "videoId": "0d423e82-4ada-42ba-9673-9fc8de0ac5fb",
                "playList": "url",
                "dashList": "url",
                "thumb": "url"
            }
        },
        "__v": 0,
        "chatId": "mpchat/5daef3586ce3c76d383e5cc2",
        "messagesCount": 1,
        "type": "practice",
        "message": {
            "time": "1572507052452",
            "content": "Andrew is the first to start practicing the scenario",
            "_user": "5d5e61c041efb46d8fe45a09",
            "type": "system-text",
            "firebaseKey": "-LsViL_D7EboDy5Qe0ak"
        },
        "firstResponseAt": null,
        "firstMessageAt": null,
        "isActive": true,
        "users": [...],
        "unreadMessagesCount": 0,
        "lastReadMessage": "",
        "status": "unread"
    }
]

* @apiErrorExample {json} FORBIDDEN:
{
  "code": 403,
  "error": "FORBIDDEN",
  "message": "FORBIDDEN"
}
*/

/*********************************************************************
* @apiVersion 4.0.0
* @api {get} /company/:companyId/chat/:chatId Get one chat
* @apiName GetChat
* @apiDescription Get one chat
* @apiGroup Chat
@apiHeader {String} Authorization* Access token

* @apiSuccessExample {json} Success-Response:
* HTTP/1.1 200 OK
* {
        "_id": "5daef3586ce3c76d383e5cc2",
        "updatedAt": "2019-11-01T15:52:19.296Z",
        "createdAt": "2019-10-22T12:17:28.596Z",
        "_moderator": {},
        "_scenario": {
             "_id": "5daefb126ce3c76d383e5ccd",
            "videoId": "id",
            "groupChat": "https://mobile-practice-dev.firebaseio.com/mpchat/5daefb126ce3c76d383e5cce",
            "name": "Titanik",
            "video": {
                "videoId": "0d423e82-4ada-42ba-9673-9fc8de0ac5fb",
                "playList": "url",
                "dashList": "url",
                "thumb": "url"
            }
        },
        "__v": 0,
        "chatId": "mpchat/5daef3586ce3c76d383e5cc2",
        "messagesCount": 1,
        "type": "practice",
        "message": {
            "time": "1572507052452",
            "content": "Andrew is the first to start practicing the scenario",
            "_user": "5d5e61c041efb46d8fe45a09",
            "type": "system-text",
            "firebaseKey": "-LsViL_D7EboDy5Qe0ak"
        },
        "firstResponseAt": null,
        "firstMessageAt": null,
        "isActive": true,
        "users": [...],
        "unreadMessagesCount": 0,
        "lastReadMessage": "",
        "status": "unread"
}

* @apiErrorExample {json} FORBIDDEN:
{
  "code": 403,
  "error": "FORBIDDEN",
  "message": "You don't have permission"
}
*/

/*********************************************************************
* @apiVersion 4.0.0
* @api {post} /company/:companyId/chat/:chatId Send chat message
* @apiName SendMessage
* @apiDescription Send chat message
* @apiGroup Chat
@apiHeader {String} Authorization* Access token
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
* @apiSuccessExample {json} Success-Response:
* HTTP/1.1 204 No Content

* @apiErrorExample {json} BAD_REQUEST:
{
   "code": 400,
   "error": "BAD_REQUEST",
   "message": "BAD_REQUEST"
}
*/

/*********************************************************************
* @apiVersion 4.0.0
* @api {delete} /company/:companyId/chat/:chatId/message/:messageId Delete chat message
* @apiName DeleteMessage
* @apiDescription Delete chat message
* @apiGroup Chat
* @apiHeader {String} Authorization* Access token
* @apiSuccessExample {json} Success-Response:
* HTTP/1.1 204 No Content

* @apiErrorExample {json} FORBIDDEN:
{
  "code": 403,
  "error": "FORBIDDEN",
  "message": "FORBIDDEN"
}
*/

/*********************************************************************
* @apiVersion 4.0.0
* @api {patch} /company/:companyId/chat/:chatId/user Manage users
* @apiName ManageUsers
* @apiDescription Delete/add chat members
* @apiGroup Chat
@apiHeader {String} Authorization* Access token
* @apiParamExample {json} Request-Example:
*   {
  "users": [ "5d5e597d41efb46d8fe45a76", "5d5e597d41efb46d8fe45a00" ]
*   }
*
* @apiParam (Body parameters) {Array} users* users
* @apiSuccessExample {json} Success-Response:
* HTTP/1.1 200 OK
* {
        "_id": "5daef3586ce3c76d383e5cc2",
        "updatedAt": "2019-11-01T15:52:19.296Z",
        "createdAt": "2019-10-22T12:17:28.596Z",
        "_moderator": {},
        "__v": 0,
        "chatId": "mpchat/5daef3586ce3c76d383e5cc2",
        "messagesCount": 1,
        "type": "practice",
        "message": {
            "time": "1572507052452",
            "content": "Andrew is the first to start practicing the scenario",
            "_user": "5d5e61c041efb46d8fe45a09",
            "type": "system-text",
            "firebaseKey": "-LsViL_D7EboDy5Qe0ak"
        },
        "firstResponseAt": null,
        "firstMessageAt": null,
        "isActive": true,
        "users": [...],
        "unreadMessagesCount": 0,
        "lastReadMessage": "",
        "status": "unread"
}

* @apiErrorExample {json} FORBIDDEN:
{
  "code": 403,
  "error": "FORBIDDEN",
  "message": "FORBIDDEN"
}
*/

/*********************************************************************
* @apiVersion 4.0.0
* @api {patch} /company/:companyId/chat/:chatId Edit chat
* @apiName EditChat
* @apiDescription Edit chat details
* @apiGroup Chat
@apiHeader {String} Authorization* Access token
*
* @apiParam (Body parameters) {String="read", "unread"} status* chat status
* @apiParam (Body parameters) {String} lastReadMessage* last read message
* @apiParam (Body parameters) {String} title* chat title
* @apiParam (Body parameters) {Array} users* chat participants
* @apiParam (Body parameters) {String} users.userId* user Id
* @apiSuccessExample {json} Success-Response:
* HTTP/1.1 200 OK
* {
        "_id": "5daef3586ce3c76d383e5cc2",
        "updatedAt": "2019-11-01T15:52:19.296Z",
        "createdAt": "2019-10-22T12:17:28.596Z",
        "_moderator": {},
        "title": "Name",
        "__v": 0,
        "chatId": "mpchat/5daef3586ce3c76d383e5cc2",
        "messagesCount": 1,
        "type": "practice",
        "message": {
            "time": "1572507052452",
            "content": "Andrew is the first to start practicing the scenario",
            "_user": "5d5e61c041efb46d8fe45a09",
            "type": "system-text",
            "firebaseKey": "-LsViL_D7EboDy5Qe0ak"
        },
        "firstResponseAt": null,
        "firstMessageAt": null,
        "isActive": true,
        "users": [...],
        "unreadMessagesCount": 0,
        "lastReadMessage": "",
        "status": "unread"
}

* @apiErrorExample {json} FORBIDDEN:
{
  "code": 403,
  "error": "FORBIDDEN",
  "message": "FORBIDDEN"
}
*/

/*********************************************************************
* @apiVersion 4.0.0
* @api {delete} /company/:companyId/chat/:chatId Delete chat
* @apiName DeleteChat
* @apiDescription Delete private group chat
* @apiGroup Chat
@apiHeader {String} Authorization* Access token
*
* @apiSuccessExample {json} Success-Response:
* HTTP/1.1 204 No Content

* @apiErrorExample {json} FORBIDDEN:
{
  "code": 403,
  "error": "FORBIDDEN",
  "message": "FORBIDDEN"
}
*/
