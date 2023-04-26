'use strict'

/**
 * @apiVersion 4.0.0
 * @api {post} /company/:companyId/scenario Create scenario
 * @apiName PostScenario
 * @apiDescription Create scenario
 * @apiGroup Scenario
 * @apiHeader {String} Authorization* Access token
 * @apiParamExample {json} Request-Example:
 {
    "name": "Company presentation",
    "info": "details of the scenario",
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
        }], // optional
    "_coach": "592b3eef97c0ba1a8ac52133",
    "_users": ["592b3eef97c0ba1a8ac52131", "592b3eef97c0ba1a8ac52132"]
 }

 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 {
    "_id": "592b3eef97c0ba1a8ac5213b",
    "chatId": "https://mobile-practice-dev.firebaseio.com/chats/5d5e597d41efb46d8fe45a06/592b3eef97c0ba1a8ac5213b",
    "groupChat": "https://mobile-practice-dev.firebaseio.com/mpchat/592b3eef97c0ba1a8ac5213b",
    "name": "Company presentation",
    "info": "details of the scenario",
    "dueDate": 1567209541000,
    "steps": ["step 1", "step 2"],
    duration: 100.6,
    videoId: 'EB554C06-9ABC-48B7-BC8F-C8C2E258C643',
    videoOrientation: 'portrait',
    size: 21222,
    "_criterias": ["592b3eef97c0ba1a8ac5213b", "592b3eef97c0ba1a8ac5213a"],
    "examples": [
            {
                "videoId": "91C57C51-8D40-482C-B2C8-30B36C62D61A",
                "name": "bp",
                "_id": "59c3d8f5c6100b35e202de57",
                "size": 0,
                "duration": 2.568333333333333,
                "videoOrientation": "portrait",
                "video": {
                    "videoId": "91C57C51-8D40-482C-B2C8-30B36C62D61A",
                    "duration": 2.568333333333333,
                    "size": 0,
                    "videoOrientation": "portrait",
                    "playList": "https://s3-eu-west-1.amazonaws.com/mobilepractice-video/HLS/91C57C51-8D40-482C-B2C8-30B36C62D61A/playlist.m3u8",
                    "dashList": "https://s3-eu-west-1.amazonaws.com/mobilepractice-video/MPEG-DASH/91C57C51-8D40-482C-B2C8-30B36C62D61A/playlist.mdp",
                    "thumb": "https://s3-eu-west-1.amazonaws.com/mobilepractice-video/HLS/91C57C51-8D40-482C-B2C8-30B36C62D61A/thumbs/00001.png"
                }
            }
        ],
    "_users": ["592b3eef97c0ba1a8ac52131", "592b3eef97c0ba1a8ac52132"],
    "_company": "592b3eef97c0ba1a8ac52122",
    "type": "draft", // complete or current
    "video": {
            "videoId": "D23411A8-D105-4E3A-A301-4B1ED4B7372A",
            "duration": 0,
            "size": 0,
            "videoOrientation": "portrait",
            "playList": "https://s3-eu-west-1.amazonaws.com/mobilepractice-video/HLS/D23411A8-D105-4E3A-A301-4B1ED4B7372A/playlist.m3u8",
            "dashList": "https://s3-eu-west-1.amazonaws.com/mobilepractice-video/MPEG-DASH/D23411A8-D105-4E3A-A301-4B1ED4B7372A/playlist.mpd",
            "thumb": "https://s3-eu-west-1.amazonaws.com/mobilepractice-video/HLS/D23411A8-D105-4E3A-A301-4B1ED4B7372A/thumbs/00001.png"
        },
    "isActive": true
 }
 * @apiErrorExample {json} FORBIDDEN:
 {
   "code": 403,
   "error": "FORBIDDEN",
   "message": "FORBIDDEN"
 }
 */

/**
 * @apiVersion 4.0.0
 * @api {get} /company/:companyId/scenario Get scenario
 * @apiName GetScenario
 * @apiDescription List scenarios
 * @apiGroup Scenario
 * @apiHeader {String} Authorization* Access token
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 {
    "_id": "592b3eef97c0ba1a8ac5213b",
    "name": "Company presentation",
    "info": "details of the scenario",
    "chatId": "https://mobile-practice-dev.firebaseio.com/chats/5d5e597d41efb46d8fe45a06/592b3eef97c0ba1a8ac5213b",
        "groupChat": "https://mobile-practice-dev.firebaseio.com/mpchat/592b3eef97c0ba1a8ac5213b",
    "dueDate": 1567209541000,
    "steps": ["step 1", "step 2"],
    duration: 100.6,
    videoId: 'EB554C06-9ABC-48B7-BC8F-C8C2E258C643',
    videoOrientation: 'portrait',
    "_criterias": ["592b3eef97c0ba1a8ac5213b", "592b3eef97c0ba1a8ac5213a"],
    "examples": [
            {
                "videoId": "91C57C51-8D40-482C-B2C8-30B36C62D61A",
                "name": "bp",
                "_id": "59c3d8f5c6100b35e202de57",
                "size": 0,
                "duration": 2.568333333333333,
                "videoOrientation": "portrait",
                "video": {
                    "videoId": "91C57C51-8D40-482C-B2C8-30B36C62D61A",
                    "duration": 2.568333333333333,
                    "size": 0,
                    "videoOrientation": "portrait",
                    "playList": "https://s3-eu-west-1.amazonaws.com/mobilepractice-video/HLS/91C57C51-8D40-482C-B2C8-30B36C62D61A/playlist.m3u8",
                    "dashList": "https://s3-eu-west-1.amazonaws.com/mobilepractice-video/MPEG-DASH/91C57C51-8D40-482C-B2C8-30B36C62D61A/playlist.mpd",
                    "thumb": "https://s3-eu-west-1.amazonaws.com/mobilepractice-video/HLS/91C57C51-8D40-482C-B2C8-30B36C62D61A/thumbs/00001.png"
                }
            }
        ],
    "_users": ["592b3eef97c0ba1a8ac52131", "592b3eef97c0ba1a8ac52132"],
    "_company": "592b3eef97c0ba1a8ac52122",
    "type": "draft", // complete or current
    "video": {
            "videoId": "D23411A8-D105-4E3A-A301-4B1ED4B7372A",
            "duration": 0,
            "size": 0,
            "videoOrientation": "portrait",
            "playList": "https://s3-eu-west-1.amazonaws.com/mobilepractice-video/HLS/D23411A8-D105-4E3A-A301-4B1ED4B7372A/playlist.m3u8",
            "dashList": "https://s3-eu-west-1.amazonaws.com/mobilepractice-video/MPEG-DASH/D23411A8-D105-4E3A-A301-4B1ED4B7372A/playlist.mpd",
            "thumb": "https://s3-eu-west-1.amazonaws.com/mobilepractice-video/HLS/D23411A8-D105-4E3A-A301-4B1ED4B7372A/thumbs/00001.png"
        },
    "isActive": true,
    "practiceStatus": {
      "messages": 0,
      "evaluated": 10, // only for coach
      "total": 20 // only for coach
    }
 }
 * @apiErrorExample {json} FORBIDDEN:
 {
   "code": 403,
   "error": "FORBIDDEN",
   "message": "FORBIDDEN"
 }
 */

/**
 * @apiVersion 4.0.0
 * @api {get} /company/:companyId/scenario/:scenarioId Get one scenario
 * @apiName GetOneScenario
 * @apiDescription Get one scenario
 * @apiGroup Scenario
 * @apiHeader {String} Authorization* Access token
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 {
    "_id": "5dcab2725bed4b72057225a1",
    "updatedAt": "2019-11-12T13:25:10.663Z",
    "createdAt": "2019-11-12T13:24:02.771Z",
    "videoId": "",
    "dueDate": "2019-12-03T21:59:59.999Z",
    "_company": "5d5e58af41efb46d8fe45a05",
    "_coach": {...},
    "isActive": true,
    "type": "current",
    "_users": [...],
    "examples": [],
    "_criterias": [...],
    "steps": [...],
    "size": 0,
    "duration": 0,
    "videoOrientation": "portrait",
    "info": "q",
    "name": "New-new",
    "__v": 0,
    "chatId": "https:...",
    "groupChat": "https:...",
    "isPracticed": true,
    "unreadMessagesGroupChat": 0,
    "video": {...},
    "userCriterias": [...],
    "practiceStatus": {
        "unreadPracticeChats": 0
    }
}
* @apiErrorExample {json} Bad Request:
 {
   "code": 400,
   "error": "BAD_REQUEST",
   "message": "BAD_REQUEST"
 }
 */

/**
 * @apiVersion 4.0.0
 * @api {patch} /company/:companyId/scenario/:scenarioId Edit scenario
 * @apiName UpdateScenario
 * @apiDescription Update scenario
 * @apiGroup Scenario
 * @apiHeader {String} Authorization* Access token
 * @apiParamExample {json} Request-Example:
 {
    "name": "Company presentation",
    "info": "details of the scenario",
    "dueDate": 1567209541000,
    "steps": ["step 1", "step 2"],
    duration: 100.6,
    videoId: 'EB554C06-9ABC-48B7-BC8F-C8C2E258C643',
    videoOrientation: 'portrait', // unique guid
    "_criterias": ["592b3eef97c0ba1a8ac5213b", "592b3eef97c0ba1a8ac5213a"],
    "examples": [{
          videoId: 'EB554C06-9ABC-48B7-BC8F-C8C2E258C642',
          duration: 100.6,
          name: 'Name'
        }], // optional
    "_coach": "592b3eef97c0ba1a8ac52133",
    "_users": ["592b3eef97c0ba1a8ac52131", "592b3eef97c0ba1a8ac52132"]
 }

 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 {
    "_id": "592b3eef97c0ba1a8ac5213b",
    "name": "Company presentation",
    "info": "details of the scenario",
    "chatId": "https://mobile-practice-dev.firebaseio.com/chats/5d5e597d41efb46d8fe45a06/592b3eef97c0ba1a8ac5213b",
    "groupChat": "https://mobile-practice-dev.firebaseio.com/mpchat/592b3eef97c0ba1a8ac5213b",
    "dueDate": 1567209541000,
    "steps": ["step 1", "step 2"],
    "videoId": "EB554C06-9ABC-48B7-BC8F-C8C2E258C641",
    "_criterias": ["592b3eef97c0ba1a8ac5213b", "592b3eef97c0ba1a8ac5213a"],
    "examples": [
            {
                "videoId": "91C57C51-8D40-482C-B2C8-30B36C62D61A",
                "name": "bp",
                "_id": "59c3d8f5c6100b35e202de57",
                "size": 0,
                "duration": 2.568333333333333,
                "videoOrientation": "portrait",
                "video": {
                    "videoId": "91C57C51-8D40-482C-B2C8-30B36C62D61A",
                    "duration": 2.568333333333333,
                    "size": 0,
                    "videoOrientation": "portrait",
                    "playList": "https://s3-eu-west-1.amazonaws.com/mobilepractice-video/HLS/91C57C51-8D40-482C-B2C8-30B36C62D61A/playlist.m3u8",
                    "dashList": "https://s3-eu-west-1.amazonaws.com/mobilepractice-video/MPEG-DASH/91C57C51-8D40-482C-B2C8-30B36C62D61A/playlist.mpd",
                    "thumb": "https://s3-eu-west-1.amazonaws.com/mobilepractice-video/HLS/91C57C51-8D40-482C-B2C8-30B36C62D61A/thumbs/00001.png"
                }
            }
        ],
    "_users": ["592b3eef97c0ba1a8ac52131", "592b3eef97c0ba1a8ac52132"],
    "_company": "592b3eef97c0ba1a8ac52122",
    "type": "draft", // complete or current
    "video": {
            "videoId": "D23411A8-D105-4E3A-A301-4B1ED4B7372A",
            "duration": 0,
            "size": 0,
            "videoOrientation": "portrait",
            "playList": "https://s3-eu-west-1.amazonaws.com/mobilepractice-video/HLS/D23411A8-D105-4E3A-A301-4B1ED4B7372A/playlist.m3u8",
            "dashList": "https://s3-eu-west-1.amazonaws.com/mobilepractice-video/MPEG-DASH/D23411A8-D105-4E3A-A301-4B1ED4B7372A/playlist.mpd",
            "thumb": "https://s3-eu-west-1.amazonaws.com/mobilepractice-video/HLS/D23411A8-D105-4E3A-A301-4B1ED4B7372A/thumbs/00001.png"
        },
    "isActive": true
 }
 * @apiErrorExample {json} FORBIDDEN:
 {
   "code": 403,
   "error": "FORBIDDEN",
   "message": "FORBIDDEN"
 }
 */

/**
 * @apiVersion 4.0.0
 * @api {delete} /company/:companyId/scenario/:scenarioId Delete scenario
 * @apiName DeleteScenario
 * @apiDescription Delete scenario
 * @apiGroup Scenario
 * @apiHeader {String} Authorization* Access token
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 {
    "_id": "592b3eef97c0ba1a8ac5213b",
    "name": "Company presentation",
    "info": "details of the scenario",
    "dueDate": 1567209541000,
    "steps": ["step 1", "step 2"],
    "videoId": "EB554C06-9ABC-48B7-BC8F-C8C2E258C641",
    "_criterias": ["592b3eef97c0ba1a8ac5213b", "592b3eef97c0ba1a8ac5213a"],
    "examples": [
            {
                "videoId": "91C57C51-8D40-482C-B2C8-30B36C62D61A",
                "name": "bp",
                "_id": "59c3d8f5c6100b35e202de57",
                "size": 0,
                "duration": 2.568333333333333,
                "videoOrientation": "portrait",
                "video": {
                    "videoId": "91C57C51-8D40-482C-B2C8-30B36C62D61A",
                    "duration": 2.568333333333333,
                    "size": 0,
                    "videoOrientation": "portrait",
                    "playList": "https://s3-eu-west-1.amazonaws.com/mobilepractice-video/HLS/91C57C51-8D40-482C-B2C8-30B36C62D61A/playlist.m3u8",
                    "dashList": "https://s3-eu-west-1.amazonaws.com/mobilepractice-video/MPEG-DASH/91C57C51-8D40-482C-B2C8-30B36C62D61A/playlist.mpd",
                    "thumb": "https://s3-eu-west-1.amazonaws.com/mobilepractice-video/HLS/91C57C51-8D40-482C-B2C8-30B36C62D61A/thumbs/00001.png"
                }
            }
        ],
    "_company": "592b3eef97c0ba1a8ac52122",
    "type": "draft", // complete or current
    "video": {
            "videoId": "D23411A8-D105-4E3A-A301-4B1ED4B7372A",
            "duration": 0,
            "size": 0,
            "videoOrientation": "portrait",
            "playList": "https://s3-eu-west-1.amazonaws.com/mobilepractice-video/HLS/D23411A8-D105-4E3A-A301-4B1ED4B7372A/playlist.m3u8",
            "dashList": "https://s3-eu-west-1.amazonaws.com/mobilepractice-video/MPEG-DASH/D23411A8-D105-4E3A-A301-4B1ED4B7372A/playlist.mpd",
            "thumb": "https://s3-eu-west-1.amazonaws.com/mobilepractice-video/HLS/D23411A8-D105-4E3A-A301-4B1ED4B7372A/thumbs/00001.png"
        },
    "isActive": false
 }
 * @apiErrorExample {json} FORBIDDEN:
 {
   "code": 403,
   "error": "FORBIDDEN",
   "message": "FORBIDDEN"
 }
 */

/**
 * @apiVersion 4.0.0
 * @api {get} /company/:companyId/admin-scenario Get scenario (for admins only)
 * @apiName GetAdminScenario
 * @apiDescription Get scenarios to users with admin credentials (system admin or company admin)
 * @apiGroup Scenario
 * @apiHeader {String} Authorization* Access token
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 [
    {
        "_id": "59e86e203b6cfa7aaa732a07",
        "name": "Retake",
        "status": "closed",
        "coach": {
            "_id": "59e86c023b6cfa7aaa7329fd",
            "name": "Piu Miu",
            "avatarSm": null,
            "avatarMd": null,
            "avatarLg": null,
            "avatarColor": "fd524f"
        },
        "createdAt": "2017-10-19T09:19:28.565Z",
        "userCompleted": 2,
        "userTotal": 2,
        "waitingOnLearner": 2,
        "waitingOnCoach": 0,
        "connections": 2
    }
 ]
 * @apiErrorExample {json} FORBIDDEN:
 {
   "code": 403,
   "error": "FORBIDDEN",
   "message": "FORBIDDEN"
 }
 */

/**
 * @apiVersion 4.0.0
 * @api {get} /company/:companyId/admin-scenario/:scenarioId Get scenario details (for admins only)
 * @apiName GetAdminScenarioDetails
 * @apiDescription Get scenarios details to users with admin credentials (system admin or company admin)
 * @apiGroup Scenario
 * @apiHeader {String} Authorization* Access token
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 {
    "name": "Demo Scenario",
    "info": "This demo Scenario is designed to introduce you to key product features.",
    "coach": {
        "_id": "57fe2450916165b0b8b20111",
        "name": "Jon Doe",
        "avatarSm": null,
        "avatarMd": null,
        "avatarLg": null,
        "avatarColor": "58c9ef"
    },
    "video": {
        "videoId": "EN",
        "duration": 34,
        "size": 394913852,
        "videoOrientation": "landscape",
        "playList": "https://s3-eu-west-1.amazonaws.com/mobilepractice-video/HLS/EN/playlist.m3u8",
        "dashList": "https://s3-eu-west-1.amazonaws.com/mobilepractice-video/MPEG-DASH/EN/playlist.mpd",
        "thumb": "https://s3-eu-west-1.amazonaws.com/mobilepractice-video/HLS/EN/thumbs/00001.png"
    },
    "steps": [
        "Prepare short personal introduction",
        "Record your introduction",
        "Evaluate this scenario"
    ],
    "criterias": [
        "Self introduction"
    ],
    "bestPractices": []
 }
 * @apiErrorExample {json} FORBIDDEN:
 {
   "code": 403,
   "error": "FORBIDDEN",
   "message": "FORBIDDEN"
 }
*/

/**
 * @apiVersion 4.0.0
 * @api {get} /company/:companyId/admin-scenario/:scenarioId/practice?name=SomeUsernameToFilterUsers Get scenario practices data (for admins only)
 * @apiName GetAdminScenarioPracticesData
 * @apiDescription Get scenarios practices data to users with admin credentials (system admin or company admin)
 * @apiGroup Scenario
 * @apiHeader {String} Authorization* Access token
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 {
    summary: {
        "learners": 3,
        "connections": 0,
        "waitingOnLearner": 3,
        "waitingOnCoach": 0,
        "evaluated": 3
    }
    list: [
        {
            "inboxId": "chats/57fe2450916165b0b8b20111/574e3a50616165b0b8b55111/59bad3cf137a3504cd6f7903/59bad3cff09d9f468ce7b65b",
            "user": {
                "name": "Merri Pippin",
                "avatarSm": null,
                "avatarMd": null,
                "avatarBg": null,
                "avatarColor": "e9d340"
            },
            "status": "complete",
            "waitingOn": "Learner",
            "connection": false,
            "userMark": [
                {
                    "mark": 2,
                    "criteria": "Evaluate.Rate.Practice.Experience"
                },
                {
                    "mark": 3,
                    "criteria": "Evaluate.Rate.Pertinent.To.Work"
                },
                {
                    "mark": 4,
                    "criteria": "Evaluate.Rate.Recommend.To.Others"
                }
            ],
            "coachMark": [
                {
                    "mark": 5,
                    "criteria": "Self introduction"
                }
            ],
            "hasUserMessage": true
        }
    ]
}
 * @apiErrorExample {json} FORBIDDEN:
 {
   "code": 403,
   "error": "FORBIDDEN",
   "message": "FORBIDDEN"
 }
*/

/**
 * @apiVersion 4.0.0
 * @api {get} /company/:companyId/admin-scenario/:scenarioId/practice/:practiceId Get scenario practice messages (for admins only)
 * @apiName GetAdminScenarioPracticeMessages
 * @apiDescription Get scenarios practice messages from firebase for security reason (system admin or company admin)
 * @apiGroup Scenario
 * @apiHeader {String} Authorization* Access token
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 [  {
        "_user": "57fe2450916165b0b8b20111",
        "content": {
            "avgMark": 5,
            "text": "Hi Gala, here's my evaluation"
        },
        "time": "1505894159405",
        "type": "evaluation"
    },
    {
        "_user": "57fe2450916165b0b8b20111",
        "content": "What did you think of the scenario?",
        "time": "1505894159407",
        "type": "evaluate"
    }
]
 * @apiErrorExample {json} FORBIDDEN:
 {
   "code": 403,
   "error": "FORBIDDEN",
   "message": "FORBIDDEN"
 }
*/

/**
 * @apiVersion 4.0.0
 * @api {post} /company/:companyId/scenario/:scenarioId/reminder Send scenario reminder
 * @apiName Send scenario reminder
 * @apiDescription Send a reminder to learners in the scenario chat
 * @apiGroup Scenario
 * @apiHeader {String} Authorization* Access token
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
 *           "videoOrientation": "portrait" // "landscape"
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
 * @api {patch} /company/:companyId/scenario/:scenarioId/reminder Edit scenario reminder
 * @apiName UpdateScenarioReminder
 * @apiDescription Update scenario reminder
 * @apiGroup Scenario
 * @apiHeader {String} Authorization* Access token
 * @apiParamExample {json} Request-Example:
 {
    "reminderIsVisible": true
 }

 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 {
    "_id": "592b3eef97c0ba1a8ac5213b",
    "name": "Company presentation",
    "info": "details of the scenario",
    "chatId": "https://mobile-practice-dev.firebaseio.com/chats/5d5e597d41efb46d8fe45a06/592b3eef97c0ba1a8ac5213b",
    "groupChat": "https://mobile-practice-dev.firebaseio.com/mpchat/592b3eef97c0ba1a8ac5213b",
    "dueDate": 1567209541000,
    "steps": ["step 1", "step 2"],
    "videoId": "EB554C06-9ABC-48B7-BC8F-C8C2E258C641",
    "reminderIsVisible": true,
    "_criterias": ["592b3eef97c0ba1a8ac5213b", "592b3eef97c0ba1a8ac5213a"],
    "examples": [...],
    "_users": ["592b3eef97c0ba1a8ac52131", "592b3eef97c0ba1a8ac52132"],
    "_company": "592b3eef97c0ba1a8ac52122",
    "type": "draft", // complete or current
    "video": {
            "videoId": "D23411A8-D105-4E3A-A301-4B1ED4B7372A",
            "duration": 0,
            "size": 0,
            "videoOrientation": "portrait",
            "playList": "https://s3-eu-west-1.amazonaws.com/mobilepractice-video/HLS/D23411A8-D105-4E3A-A301-4B1ED4B7372A/playlist.m3u8",
            "dashList": "https://s3-eu-west-1.amazonaws.com/mobilepractice-video/MPEG-DASH/D23411A8-D105-4E3A-A301-4B1ED4B7372A/playlist.mpd",
            "thumb": "https://s3-eu-west-1.amazonaws.com/mobilepractice-video/HLS/D23411A8-D105-4E3A-A301-4B1ED4B7372A/thumbs/00001.png"
        },
    "isActive": true
 }
 * @apiErrorExample {json} FORBIDDEN:
 {
   "code": 403,
   "error": "FORBIDDEN",
   "message": "FORBIDDEN"
 }
 */
