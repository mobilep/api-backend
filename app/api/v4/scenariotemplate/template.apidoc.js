/** *****************************************
 * @apiVersion 4.0.0
 * @api {post} /company/:companyId/template Create template
 * @apiName CreateTemplate
 * @apiDescription Create scenario template
 * @apiGroup Company
 *
 * @apiHeader {String} Authorization* Access token
 *
 * @apiParam (Path parameters) {String} companyId* Company id
 *
 * @apiParamExample {json} Request-Example:
 {
    "name": "Scenario template",
    "info": "details of the template",
    "dueDate": 1567209541000,
    "steps": ["step 1", "step 2"],
    duration: 100.6,
    videoId: 'EB554C06-9ABC-48B7-BC8F-C8C2E258C643',
    videoOrientation: 'portrait',
    size: 21222,
    "_criterias": ["592b3eef97c0ba1a8ac5213b", "592b3eef97c0ba1a8ac5213a"],
    "examples": [{
          videoId: 'EB554C06-9ABC-48B7-BC8F-C8C2E258C642',
          duration: 100.6,
          name: 'Name'
        }] // optional
 }
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
    "updatedAt": "2020-04-23T12:17:55.636Z",
    "createdAt": "2020-04-23T12:17:55.636Z",
    "dueDate": "2020-05-22T15:05:30.000Z",
    "videoId": "EB554C06-9ABC-48B7-BC8F-C8C2E258C643",
    "_company": "5d5e58af41efb46d8fe45a05",
    "_id": "5ea187731a2b4b6a1aadb6fc",
    "logs": [],
    "isActive": true,
    "canEditVideo": true,
    "examples": [
        {
            "videoId": "EB554C06-9ABC-48B7-BC8F-C8C2E258C642",
            "name": "Name",
            "_id": "5ea187731a2b4b6a1aadb6fd",
            "size": 0,
            "duration": 100.6,
            "videoOrientation": "portrait",
            "video": {
                "videoId": "EB554C06-9ABC-48B7-BC8F-C8C2E258C642",
                "duration": 100.6,
                "size": 0,
                "videoOrientation": "portrait",
                "playList": "https://...",
                "dashList": "https://...",
                "thumb": "https://..."
            }
        }
    ],
    "_criterias": [
        "592b3eef97c0ba1a8ac5213b",
        "592b3eef97c0ba1a8ac5213a"
    ],
    "steps": [
        "step 1",
        "step 2"
    ],
    "size": 21222,
    "duration": 100.6,
    "videoOrientation": "portrait",
    "info": "details of the scenario",
    "name": "Company presentation",
    "video": {
        "videoId": "EB554C06-9ABC-48B7-BC8F-C8C2E258C643",
        "duration": 100.6,
        "size": 21222,
        "videoOrientation": "portrait",
        "playList": "https://...",
        "dashList": "https://...",
        "thumb": "https://..."
    }
}
 *
 * @apiErrorExample {json} FORBIDDEN:
 {
   "code": 403,
   "error": "FORBIDDEN",
   "message": "FORBIDDEN"
 }
 * @apiErrorExample {json} Bad Request:
 {
   "code": 400,
   "error": "BAD_REQUEST",
   "message": "BAD_REQUEST"
 }
 */

/** *****************************************
 * @apiVersion 4.0.0
 * @api {post} /company/:companyId/template/:templateId/assign Assign scenario to coach
 * @apiName AssignScenario
 * @apiDescription Assign scenario to coach
 * @apiGroup Company
 *
 * @apiHeader {String} Authorization* Access token
 *
 * @apiParam (Path parameters) {String} companyId* Company id
 * @apiParam (Path parameters) {String} templateId* Template id
 *
 * * @apiParamExample {json} Request-Example:
 [ "592b3eef97c0ba1a8ac5213b", "592b3eef97c0ba1a8ac5333"]
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 204 OK
 *
 * @apiErrorExample {json} FORBIDDEN:
 {
   "code": 403,
   "error": "FORBIDDEN",
   "message": "FORBIDDEN"
 }
 * @apiErrorExample {json} Bad Request:
 {
   "code": 400,
   "error": "BAD_REQUEST",
   "message": "BAD_REQUEST"
 }
 */

/** *****************************************
 * @apiVersion 4.0.0
 * @api {patch} /company/:companyId/template/:templateId Edit template
 * @apiName EditTemplate
 * @apiDescription Edit template
 * @apiGroup Company
 *
 * @apiHeader {String} Authorization* Access token
 *
 * @apiParam (Path parameters) {String} companyId* Company id
 * @apiParam (Path parameters) {String} templateId* Template id
 *
 * @apiParamExample {json} Request-Example:
 {
    "name": "Scenario template",
    "info": "details of the template",
    "dueDate": 1567209541000,
    "steps": ["step 1", "step 2"],
    duration: 100.6,
    videoId: 'EB554C06-9ABC-48B7-BC8F-C8C2E258C643',
    videoOrientation: 'portrait',
    size: 21222,
    "_criterias": ["592b3eef97c0ba1a8ac5213b", "592b3eef97c0ba1a8ac5213a"],
    "examples": [{
          videoId: 'EB554C06-9ABC-48B7-BC8F-C8C2E258C642',
          duration: 100.6,
          name: 'Name'
        }] // optional
 }
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
    "updatedAt": "2020-04-23T12:17:55.636Z",
    "createdAt": "2020-04-23T12:17:55.636Z",
    "dueDate": "2020-05-22T15:05:30.000Z",
    "videoId": "EB554C06-9ABC-48B7-BC8F-C8C2E258C643",
    "_company": "5d5e58af41efb46d8fe45a05",
    "_id": "5ea187731a2b4b6a1aadb6fc",
    "logs": [],
    "isActive": true,
    "canEditVideo": true,
    "examples": [
        {
            "videoId": "EB554C06-9ABC-48B7-BC8F-C8C2E258C642",
            "name": "Name",
            "_id": "5ea187731a2b4b6a1aadb6fd",
            "size": 0,
            "duration": 100.6,
            "videoOrientation": "portrait",
            "video": {
                "videoId": "EB554C06-9ABC-48B7-BC8F-C8C2E258C642",
                "duration": 100.6,
                "size": 0,
                "videoOrientation": "portrait",
                "playList": "https://...",
                "dashList": "https://...",
                "thumb": "https://..."
            }
        }
    ],
    "_criterias": [
        "592b3eef97c0ba1a8ac5213b",
        "592b3eef97c0ba1a8ac5213a"
    ],
    "steps": [
        "step 1",
        "step 2"
    ],
    "size": 21222,
    "duration": 100.6,
    "videoOrientation": "portrait",
    "info": "details of the scenario",
    "name": "Company presentation",
    "video": {
        "videoId": "EB554C06-9ABC-48B7-BC8F-C8C2E258C643",
        "duration": 100.6,
        "size": 21222,
        "videoOrientation": "portrait",
        "playList": "https://...",
        "dashList": "https://...",
        "thumb": "https://..."
    }
}
 *
 * @apiErrorExample {json} FORBIDDEN:
 {
   "code": 403,
   "error": "FORBIDDEN",
   "message": "FORBIDDEN"
 }
 * @apiErrorExample {json} Bad Request:
 {
   "code": 400,
   "error": "BAD_REQUEST",
   "message": "BAD_REQUEST"
 }
 */

/** *****************************************
 * @apiVersion 4.0.0
 * @api {patch} /company/:companyId/template Delete template
 * @apiName DeleteTemplate
 * @apiDescription Delete template
 * @apiGroup Company
 *
 * @apiHeader {String} Authorization* Access token
 *
 * @apiParam (Path parameters) {String} companyId* Company id
 *
 * @apiParamExample {json} Request-Example:
 [
   "592b3eef97c0ba1a8ac5213b",
   "592b3eef97c0ba1a8ac5214b"
  ]
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 204 OK
 *
 * @apiErrorExample {json} FORBIDDEN:
 {
   "code": 403,
   "error": "FORBIDDEN",
   "message": "FORBIDDEN"
 }
 * @apiErrorExample {json} Bad Request:
 {
   "code": 400,
   "error": "BAD_REQUEST",
   "message": "BAD_REQUEST"
 }
 */

/** *****************************************
 * @apiVersion 4.0.0
 * @api {get} /company/:companyId/template Get all templates
 * @apiName GetAllTemplates
 * @apiDescription Get all templates
 * @apiGroup Company
 *
 * @apiHeader {String} Authorization* Access token
 *
 * @apiParam (Path parameters) {String} companyId* Company id
 *
 * @apiSuccess (Success Response) {Object[]} response* templates list
 * @apiSuccess (Success Response) {String} response._id* template id
 * @apiSuccess (Success Response) {String} response.name* template name
 * @apiSuccess (Success Response) {String} response.createdAt* date created
 * @apiSuccess (Success Response) {Object[]} response.logs* logs when coach was assigned for scenario
 * @apiSuccess (Success Response) {Object} response.logs.user* user details
 * @apiSuccess (Success Response) {String} response.logs.user._id* user id
 * @apiSuccess (Success Response) {String} response.logs.user.firstName* first name
 * @apiSuccess (Success Response) {String} response.logs.user.lastName* last name
 * @apiSuccess (Success Response) {String} response.logs.sentAt* date sent
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * [
    {
        "_id": "5ea18635d000ee69aff99417",
        "name": "Company presentation1",
        "createdAt": "2020-04-23T12:12:37.524Z",
        "logs": []
    },
    {
        "_id": "5ea187731a2b4b6a1aadb6fc",
        "name": "Company presentation22",
        "createdAt": "2020-04-23T12:17:55.636Z",
        "logs": [
            {
                "user": {
                    "_id": "5d5e597d41efb46d8fe45a00",
                    "firstName": "Ann",
                    "lastName": "Jane"
                },
                "sentAt": "2020-04-23T12:31:25.232Z"
            }
        ]
    }
]
 *
 * @apiErrorExample {json} FORBIDDEN:
 {
   "code": 403,
   "error": "FORBIDDEN",
   "message": "FORBIDDEN"
 }
 * @apiErrorExample {json} Bad Request:
 {
   "code": 400,
   "error": "BAD_REQUEST",
   "message": "BAD_REQUEST"
 }
 */

/** *****************************************
 * @apiVersion 4.0.0
 * @api {get} /company/:companyId/template/:templateId Get template info
 * @apiName GetTemplateInfo
 * @apiDescription Get template info
 * @apiGroup Company
 *
 * @apiHeader {String} Authorization* Access token
 *
 * @apiParam (Path parameters) {String} companyId* Company id
 * @apiParam (Path parameters) {String} templateId* Template id
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
    "_id": "5ea18635d000ee69aff99417",
    "updatedAt": "2020-04-23T12:12:37.524Z",
    "createdAt": "2020-04-23T12:12:37.524Z",
    "dueDate": "2020-05-22T15:05:30.000Z",
    "videoId": "EB554C06-9ABC-48B7-BC8F-C8C2E258C643",
    "_company": "5d5e58af41efb46d8fe45a05",
    "logs": [],
    "isActive": true,
    "canEditVideo": true,
    "examples": [
        {
            "videoId": "EB554C06-9ABC-48B7-BC8F-C8C2E258C642",
            "name": "Name",
            "_id": "5ea18635d000ee69aff99418",
            "size": 0,
            "duration": 100.6,
            "videoOrientation": "portrait",
            "video": {
                "videoId": "EB554C06-9ABC-48B7-BC8F-C8C2E258C642",
                "duration": 100.6,
                "size": 0,
                "videoOrientation": "portrait",
                "playList": "https://...",
                "dashList": "https://...",
                "thumb": "https://..."
            }
        }
    ],
    "_criterias": [],
    "steps": [],
    "size": 21222,
    "duration": 100.6,
    "videoOrientation": "portrait",
    "info": "details of the scenario",
    "name": "Company presentation",
    "video": {
        "videoId": "EB554C06-9ABC-48B7-BC8F-C8C2E258C643",
        "duration": 100.6,
        "size": 21222,
        "videoOrientation": "portrait",
        "playList": "https://...",
        "dashList": "https://...",
        "thumb": "https://..."
    }
}
 *
 * @apiErrorExample {json} FORBIDDEN:
 {
   "code": 403,
   "error": "FORBIDDEN",
   "message": "FORBIDDEN"
 }
 * @apiErrorExample {json} Bad Request:
 {
   "code": 400,
   "error": "BAD_REQUEST",
   "message": "BAD_REQUEST"
 }
 * @apiErrorExample {json} NOT FOUND:
 {
   "code": 404,
   "error": "NOT_FOUND",
   "message": "NOT_FOUND"
 }
 */
