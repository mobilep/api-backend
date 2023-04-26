'use strict'

/**
 * @apiVersion 1.0.0
 * @api {post} /company/:companyId/scenario Create scenario
 * @apiName PostScenario
 * @apiDescription Create scenario
 * @apiGroup Scenario
 * @apiParamExample {json} Request-Example:
 {
    "name": "Company presentation",
    "info": "details of the scenario",
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
    "name": "Company presentation",
    "info": "details of the scenario",
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
 * @apiVersion 1.0.0
 * @api {get} /company/:companyId/scenario Get scenario
 * @apiName GetScenario
 * @apiDescription List scenarios
 * @apiGroup Scenario
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 {
    "_id": "592b3eef97c0ba1a8ac5213b",
    "name": "Company presentation",
    "info": "details of the scenario",
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
      "evaluated": 10 // only for coach
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
 * @apiVersion 1.0.0
 * @api {patch} /company/:companyId/scenario/:scenarioId Edit scenario
 * @apiName UpdateScenario
 * @apiDescription Update scenario
 * @apiGroup Scenario
 * @apiParamExample {json} Request-Example:
 {
    "name": "Company presentation",
    "info": "details of the scenario",
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
 * @apiVersion 1.0.0
 * @api {delete} /company/:companyId/scenario/:scenarioId Delete scenario
 * @apiName DeleteScenario
 * @apiDescription Delete scenario
 * @apiGroup Scenario
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 {
    "_id": "592b3eef97c0ba1a8ac5213b",
    "name": "Company presentation",
    "info": "details of the scenario",
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
 * @apiVersion 1.0.0
 * @api {get} /company/:companyId/admin-scenario Get scenario (for admins only)
 * @apiName GetAdminScenario
 * @apiDescription Get scenarios to users with admin credentials (system admin or company admin)
 * @apiGroup Scenario
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 [
    {
        "_id": "59e86e203b6cfa7aaa732a07",
        "name": "Retake",
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
        "userTotal": 2
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
 * @apiVersion 1.0.0
 * @api {get} /company/:companyId/admin-scenario/:scenarioId Get scenario details (for admins only)
 * @apiName GetAdminScenarioDetails
 * @apiDescription Get scenarios details to users with admin credentials (system admin or company admin)
 * @apiGroup Scenario
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
 * @apiVersion 1.0.0
 * @api {get} /company/:companyId/admin-scenario/:scenarioId/practice?name=SomeUsernameToFilterUsers Get scenario practices (for admins only)
 * @apiName GetAdminScenarioPractices
 * @apiDescription Get scenarios practices to users with admin credentials (system admin or company admin)
 * @apiGroup Scenario
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 [
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
 * @apiErrorExample {json} FORBIDDEN:
 {
   "code": 403,
   "error": "FORBIDDEN",
   "message": "FORBIDDEN"
 }
*/

/**
 * @apiVersion 1.0.0
 * @api {get} /company/:companyId/admin-scenario/:scenarioId/practice/:practiceId Get scenario practice messages (for admins only)
 * @apiName GetAdminScenarioPracticeMessages
 * @apiDescription Get scenarios practice messages from firebase for security reason (system admin or company admin)
 * @apiGroup Scenario
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
