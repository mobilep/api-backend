/** *****************************************
 * @apiVersion 4.0.0
 * @api {get} /company/:companyId/report-learner Learner report
 * @apiName LearnerReport
 * @apiDescription Learner report (overview)
 * @apiGroup Report
 *
 * @apiHeader {String} Authorization* Access token
 *
 * @apiParam (Path parameters) {String} companyId* Company id
 *
 * @apiParam (Query parameters) {Number} from date filter "from" (UTC timestamp in ms)
 * @apiParam (Query parameters) {Number} to date filter "to" (UTC timestamp in ms)
 * @apiParam (Query parameters) {String} coach coach id
 *
 * @apiSuccess (Success Response) {Object} user* user data
 * @apiSuccess (Success Response) {Number} user.avgScore* average scenario score
 * @apiSuccess (Success Response) {Number} user.current* number of current scenarios
 * @apiSuccess (Success Response) {Number} user.complete* number of complete scenarios
 * @apiSuccess (Success Response) {Number} user.responsiveness* responsiveness in ms
 * @apiSuccess (Success Response) {Object} team* team data
 * @apiSuccess (Success Response) {Number} team.avgScore* average scenario score
 * @apiSuccess (Success Response) {Number} team.current* number of current scenarios
 * @apiSuccess (Success Response) {Number} team.complete* number of complete scenarios
 * @apiSuccess (Success Response) {Number} team.responsiveness* responsiveness in ms
 * @apiSuccess (Success Response) {Object[]} avgByScenario* avg score by scenarios
 * @apiSuccess (Success Response) {String} avgByScenario._id* scenario id
 * @apiSuccess (Success Response) {String} avgByScenario.name* scenario name
 * @apiSuccess (Success Response) {Number} avgByScenario.team* team avg score
 * @apiSuccess (Success Response) {Number} avgByScenario.user* user score
 * @apiSuccess (Success Response) {Object[]} responsivenessByScenario* responsiveness by scenarios
 * @apiSuccess (Success Response) {String} responsivenessByScenario._id* scenario id
 * @apiSuccess (Success Response) {String} responsivenessByScenario.name* scenario name
 * @apiSuccess (Success Response) {Number} responsivenessByScenario.team* team responsiveness
 * @apiSuccess (Success Response) {Number} responsivenessByScenario.user* user responsiveness
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "user": {
 *       "avgScore": 3.6666666666666665,
 *       "current": 39,
 *       "complete": 15,
 *       "responsiveness": 3566
 *   },
 *   "team": {
 *       "avgScore": 3.487468671679198,
 *       "current": 141,
 *       "complete": 77,
 *       "responsiveness": 4566
 *   },
 *   "avgByScenario": [
 *       {
 *           "_id": "5de104777acb23a2f8b4a895",
 *           "name": "Scenario 1",
 *           "team": 4,
 *           "user": 4
 *       }
 *     ],
 *     "responsivenessByScenario": [
 *       {
 *           "_id": "5e3426a2b4da242b6e748a0a",
 *           "name": "Scenario 1",
 *           "team": 3454566,
 *           "user": 5464567
 *       }
 *     ]
 * }
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
 * @api {get} /company/:companyId/coach Get coaches
 * @apiName GetCoaches
 * @apiDescription Coaches of current user
 * @apiGroup Report
 *
 * @apiHeader {String} Authorization* Access token
 *
 * @apiParam (Path parameters) {String} companyId* Company id
 *
 *
 * @apiSuccess (Success Response) {Object[]} response* coach list
 * @apiSuccess (Success Response) {Number} response._id* coach id
 * @apiSuccess (Success Response) {Number} response.name* coach name
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 [
    {
        "_id": "5d5e61c041efb46d8fy45a09",
        "name": "Andrew Kowalski"
    },
    {
        "_id": "5d5e62e741efb46d8fy45a0c",
        "name": "Ann Jane"
    },
    {
        "_id": "5da99f7b80eb209ccay1503e",
        "name": "Ben Brown"
    }
]
 *
 * @apiErrorExample {json} FORBIDDEN:
 {
   "code": 403,
   "error": "FORBIDDEN",
   "message": "FORBIDDEN"
 }
 */

/** *****************************************
 * @apiVersion 4.0.0
 * @api {get} /company/:companyId/scenario-learner/:scenarioId Scenario score details (learner)
 * @apiName ScenarioScoreDetailsLearner
 * @apiDescription Scenario score details (learner)
 * @apiGroup Report
 *
 * @apiHeader {String} Authorization* Access token
 *
 * @apiParam (Path parameters) {String} companyId* Company id
 * @apiParam (Path parameters) {String} scenarioId* Scenario id
 *
 *
 * @apiSuccess (Success Response) {Number} scenarioName* scenario name
 * @apiSuccess (Success Response) {Number} scenarioId* scenario id
 * @apiSuccess (Success Response) {Number} userAvgScore* user average score
 * @apiSuccess (Success Response) {Number} teamAvgScore* team average score
 * @apiSuccess (Success Response) {Object[]} criterias* list of scenario criterias
 * @apiSuccess (Success Response) {String} criterias._id* criteria id
 * @apiSuccess (Success Response) {String} criterias.name* criteria name
 * @apiSuccess (Success Response) {Number} criterias.team* team average score by criteria
 * @apiSuccess (Success Response) {Number} criterias.user* user average score by criteria
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 {
    "scenarioName": "Titanik",
    "scenarioId": "5daef1116ce3c76d383e5cb9",
    "userAvgScore": 1.5,
    "teamAvgScore": 1.5,
    "criterias": [
        {
            "_id": "5da026a580dd3a395f49bd22",
            "name": "Bad",
            "team": 1,
            "user": 1
        },
        {
            "_id": "5e34269bb4da242b6e748a09",
            "name": "test",
            "team": 2,
            "user": 2
        }
    ]
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
 * @api {get} /company/:companyId/report-coach Coach report
 * @apiName CoachReport
 * @apiDescription Coach report (overview)
 * @apiGroup Report
 *
 * @apiHeader {String} Authorization* Access token
 *
 * @apiParam (Path parameters) {String} companyId* Company id
 *
 * @apiParam (Query parameters) {Number} from date filter "from" (UTC timestamp in ms)
 * @apiParam (Query parameters) {Number} to date filter "to" (UTC timestamp in ms)
 *
 * @apiSuccess (Success Response) {Object} team* team data
 * @apiSuccess (Success Response) {Number} team.avgScore* average scenario score
 * @apiSuccess (Success Response) {Number} team.responsiveness* responsiveness in ms
 * @apiSuccess (Success Response) {Number} team.current* number of current scenarios
 * @apiSuccess (Success Response) {Number} team.complete* number of complete scenarios
 * @apiSuccess (Success Response) {Object} team.scoreRanking* team ranking by score
 * @apiSuccess (Success Response) {Object} team.scoreRanking.currentPosition* team current position
 * @apiSuccess (Success Response) {Object} team.scoreRanking.total* team total positions
 * @apiSuccess (Success Response) {Object} team.responsivenessRanking* team ranking by resposiveness
 * @apiSuccess (Success Response) {Object} team.responsivenessRanking.currentPosition* team current position
 * @apiSuccess (Success Response) {Object} team.responsivenessRanking.total* team total positions
 * @apiSuccess (Success Response) {Object} company* company data
 * @apiSuccess (Success Response) {Number} company.avgScore* average scenario score
 * @apiSuccess (Success Response) {Number} company.responsiveness* responsiveness in ms
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
{
    "team": {
        "avgScore": 3,
        "responsiveness": 0,
        "current": 32,
        "complete": 3,
        "scoreRanking": {
            "currentPosition": 4,
            "total": 5
        },
        "responsivenessRanking": {
            "currentPosition": 5,
            "total": 5
        }
    },
    "company": {
        "avgScore": 2.966666666666667,
        "responsiveness": 856263633
    }
}
 *
 * @apiErrorExample {json} Bad Request:
 {
   "code": 400,
   "error": "BAD_REQUEST",
   "message": "BAD_REQUEST"
 }
 * @apiErrorExample {json} FORBIDDEN:
 {
   "code": 403,
   "error": "FORBIDDEN",
   "message": "FORBIDDEN"
 }
 */

/** *****************************************
 * @apiVersion 4.0.0
 * @api {get} /company/:companyId/report-coach/user-score User scores list
 * @apiName UserScoresList
 * @apiDescription User scores list
 * @apiGroup Report
 *
 * @apiHeader {String} Authorization* Access token
 *
 * @apiParam (Path parameters) {String} companyId* Company id
 *
 * @apiParam (Query parameters) {Number} from date filter "from" (UTC timestamp in ms)
 * @apiParam (Query parameters) {Number} to date filter "to" (UTC timestamp in ms)
 *
 * @apiSuccess (Success Response) {Number} teamAvgScore* team average score
 * @apiSuccess (Success Response) {Number} companyAvgScore* company average score
 * @apiSuccess (Success Response) {Array} users* list of users in team
 * @apiSuccess (Success Response) {String} users._id* user id
 * @apiSuccess (Success Response) {Number} users.avgScore* user average scenario score
 * @apiSuccess (Success Response) {String} users.firstName* user first name
 * @apiSuccess (Success Response) {String} users.lastName* user last name
 * @apiSuccess (Success Response) {String} users.avatar_sm* avatar link
 * @apiSuccess (Success Response) {String} users.avatarColor* avatar color
 *
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
{
    "teamAvgScore": 3.3333333333333335,
    "companyAvgScore": 3.4302325581395348,
    "users": [
        {
            "_id": "5d5e62e741efb46d8fe45a0c",
            "avgScore": 4,
            "firstName": "Ben",
            "lastName": "Brown",
            "avatar_sm": "https://...",
            "avatarColor": "3cd861"
        },
        {
            "_id": "5d5e597d41efb46d8fe45a06",
            "avgScore": 3.2,
            "firstName": "Andrew",
            "lastName": "Kowalski",
            "avatar_sm": "https://...",
            "avatarColor": "ffbe42"
        }
    ]
}
 *
 * @apiErrorExample {json} Bad Request:
 {
   "code": 400,
   "error": "BAD_REQUEST",
   "message": "BAD_REQUEST"
 }
 * @apiErrorExample {json} FORBIDDEN:
 {
   "code": 403,
   "error": "FORBIDDEN",
   "message": "FORBIDDEN"
 }
 */

/** *****************************************
 * @apiVersion 4.0.0
 * @api {get} /company/:companyId/report-coach/user-responsiveness User responsiveness list
 * @apiName UserResponsivenessList
 * @apiDescription User responsiveness list
 * @apiGroup Report
 *
 * @apiHeader {String} Authorization* Access token
 *
 * @apiParam (Path parameters) {String} companyId* Company id
 *
 * @apiParam (Query parameters) {Number} from date filter "from" (UTC timestamp in ms)
 * @apiParam (Query parameters) {Number} to date filter "to" (UTC timestamp in ms)
 *
 * @apiSuccess (Success Response) {Number} teamResponsiveness* team average responsiveness
 * @apiSuccess (Success Response) {Number} companyResponsiveness* company average responsiveness
 * @apiSuccess (Success Response) {Array} users* list of users in team
 * @apiSuccess (Success Response) {String} users._id* user id
 * @apiSuccess (Success Response) {Number} users.responsiveness* user average responsiveness
 * @apiSuccess (Success Response) {String} users.firstName* user first name
 * @apiSuccess (Success Response) {String} users.lastName* user last name
 * @apiSuccess (Success Response) {String} users.avatar_sm* avatar link
 * @apiSuccess (Success Response) {String} users.avatarColor* avatar color
 *
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
{
    "teamResponsiveness": 3801933895,
    "companyResponsiveness": 4461556907.333333,
    "users": [
        {
            "_id": "5da99f7b80eb209cca51503e",
            "responsiveness": 0,
            "firstName": "Bella",
            "lastName": "Swan",
            "avatar_sm": "https://...",
            "avatarColor": "a457ec"
        },
        {
            "_id": "5da99c59e970333456d6f7bd",
            "responsiveness": 56566677,
            "firstName": "Ivan",
            "lastName": "Bonny",
            "avatar_sm": null,
            "avatarColor": "a457ec"
        }
    ]
}
 *
 * @apiErrorExample {json} Bad Request:
 {
   "code": 400,
   "error": "BAD_REQUEST",
   "message": "BAD_REQUEST"
 }
 * @apiErrorExample {json} FORBIDDEN:
 {
   "code": 403,
   "error": "FORBIDDEN",
   "message": "FORBIDDEN"
 }
 */

/** *****************************************
 * @apiVersion 4.0.0
 * @api {get} /company/:companyId/report-coach/user-score/:userId Team member score details
 * @apiName ScoreDetails
 * @apiDescription Team member score details
 * @apiGroup Report
 *
 * @apiHeader {String} Authorization* Access token
 *
 * @apiParam (Path parameters) {String} companyId* Company id
 * @apiParam (Path parameters) {String} userId* User id
 *
 * @apiParam (Query parameters) {Number} from date filter "from" (UTC timestamp in ms)
 * @apiParam (Query parameters) {Number} to date filter "to" (UTC timestamp in ms)
 *
 * @apiSuccess (Success Response) {Number} userAvgScore* user average score
 * @apiSuccess (Success Response) {Number} teamAvgScore* team average score
 * @apiSuccess (Success Response) {Object} user* user data
 * @apiSuccess (Success Response) {String} user._id* user id
 * @apiSuccess (Success Response) {String} user.firstName* user first name
 * @apiSuccess (Success Response) {String} user.lastName* user last name
 * @apiSuccess (Success Response) {String} user.avatar_md* avatar link medium
 * @apiSuccess (Success Response) {String} user.avatar_sm* avatar link small
 * @apiSuccess (Success Response) {String} user.avatarColor* avatar color
 * @apiSuccess (Success Response) {Object[]} avgByScenario* score details per scenario
 * @apiSuccess (Success Response) {String} avgByScenario._id* scenario id
 * @apiSuccess (Success Response) {String} avgByScenario.scenarioName* scenario name
 * @apiSuccess (Success Response) {Number} avgByScenario.team* team average score
 * @apiSuccess (Success Response) {Number} avgByScenario.user* user average score
 *
 *
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
{
    "userAvgScore": 3.6159420289855073,
    "teamAvgScore": 3.442528735632184,
    "user": {
        "_id": "5d5e62e741efb46d8fe45a0c",
        "firstName": "Ann",
        "lastName": "Jane",
        "avatar_md": "https://...",
        "avatar_lg": "https://...",
        "avatarColor": "3cd861"
    },
    "avgByScenario": [
        {
            "_id": "5daeee5f6ce3c76d383e5cb1",
            "scenarioName": "Scenario 1",
            "team": 4.333333333333333,
            "user": 4
        },
        {
            "_id": "5d9edfb32f9bbd557f03d79f",
            "scenarioName": "Scenario 2",
            "team": 4.333333333333333,
            "user": 4.333333333333333
        }
    ]
}
 *
 * @apiErrorExample {json} Bad Request:
 {
   "code": 400,
   "error": "BAD_REQUEST",
   "message": "BAD_REQUEST"
 }
 * @apiErrorExample {json} FORBIDDEN:
 {
   "code": 403,
   "error": "FORBIDDEN",
   "message": "FORBIDDEN"
 }
 */

/** *****************************************
 * @apiVersion 4.0.0
 * @api {get} /company/:companyId/report-coach/user-responsiveness/:userId Team member responsiveness details
 * @apiName ResponsivenessDetails
 * @apiDescription Team member responsiveness details
 * @apiGroup Report
 *
 * @apiHeader {String} Authorization* Access token
 *
 * @apiParam (Path parameters) {String} companyId* Company id
 * @apiParam (Path parameters) {String} userId* User id
 *
 * @apiParam (Query parameters) {Number} from date filter "from" (UTC timestamp in ms)
 * @apiParam (Query parameters) {Number} to date filter "to" (UTC timestamp in ms)
 *
 * @apiSuccess (Success Response) {Number} userAvgScore* user average score
 * @apiSuccess (Success Response) {Number} teamAvgScore* team average score
 * @apiSuccess (Success Response) {Object} user* user data
 * @apiSuccess (Success Response) {String} user._id* user id
 * @apiSuccess (Success Response) {String} user.firstName* user first name
 * @apiSuccess (Success Response) {String} user.lastName* user last name
 * @apiSuccess (Success Response) {String} user.avatar_md* avatar link medium
 * @apiSuccess (Success Response) {String} user.avatar_sm* avatar link small
 * @apiSuccess (Success Response) {String} user.avatarColor* avatar color
 * @apiSuccess (Success Response) {Object[]} responsivenessByScenario* responsiveness details per scenario
 * @apiSuccess (Success Response) {String} responsivenessByScenario._id* scenario id
 * @apiSuccess (Success Response) {String} responsivenessByScenario.scenarioName* scenario name
 * @apiSuccess (Success Response) {Number} responsivenessByScenario.team* team average responsiveness in ms
 * @apiSuccess (Success Response) {Number} responsivenessByScenario.user* user average responsiveness in ms
 *
 *
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
{
    "userResponsiveness": 546547658,
    "teamResponsiveness": 3801933895,
    "user": {
        "_id": "5d5e61c041efb46d8fe45a09",
        "firstName": "Ann",
        "lastName": "Jane",
        "avatar_md": "https://...",
        "avatar_lg": "https://...",
        "avatarColor": "ffbe42"
    },
    "responsivenessByScenario": [
        {
            "_id": "5dee3d83d75c3b96320d5323",
            "scenarioName": "Scenario 1",
            "team": 567567,
            "user": 6756757
        },
        {
            "_id": "5dee2b6b2673ee2e31c835be",
            "scenarioName": "Scenario 2",
            "team": 765467,
            "user": 4756765
        }
    ]
}
 *
 * @apiErrorExample {json} Bad Request:
 {
   "code": 400,
   "error": "BAD_REQUEST",
   "message": "BAD_REQUEST"
 }
 * @apiErrorExample {json} FORBIDDEN:
 {
   "code": 403,
   "error": "FORBIDDEN",
   "message": "FORBIDDEN"
 }
 */

/** *****************************************
 * @apiVersion 4.0.0
 * @api {get} /company/:companyId/report-coach/user-score/:userId/scenario/:scenarioId Scenario score details (coach)
 * @apiName ScenarioScoreDetailsCoach
 * @apiDescription Scenario score details (coach)
 * @apiGroup Report
 *
 * @apiHeader {String} Authorization* Access token
 *
 * @apiParam (Path parameters) {String} companyId* Company id
 * @apiParam (Path parameters) {String} userId* User id
 * @apiParam (Path parameters) {String} scenarioId* Scenario id
 *
 * @apiSuccess (Success Response) {Number} scenarioName* scenario name
 * @apiSuccess (Success Response) {Number} scenarioId* scenario id
 * @apiSuccess (Success Response) {Number} userAvgScore* user average score
 * @apiSuccess (Success Response) {Number} teamAvgScore* team average score
 * @apiSuccess (Success Response) {Object} user* user data
 * @apiSuccess (Success Response) {String} user._id* user id
 * @apiSuccess (Success Response) {String} user.name* user name
 * @apiSuccess (Success Response) {String} user.avatar_md* avatar link medium
 * @apiSuccess (Success Response) {String} user.avatar_sm* avatar link small
 * @apiSuccess (Success Response) {String} user.avatarColor* avatar color
 * @apiSuccess (Success Response) {Object[]} criterias* list of scenario criterias
 * @apiSuccess (Success Response) {String} criterias._id* criteria id
 * @apiSuccess (Success Response) {String} criterias.name* criteria name
 * @apiSuccess (Success Response) {Number} criterias.team* team average score by criteria
 * @apiSuccess (Success Response) {Number} criterias.user* user average score by criteria
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
{
    "scenario": "Scenario",
    "userAvgScore": 5,
    "teamAvgScore": 4.333333333333333,
    "user": {
        "_id": "5d5e61c041efb46d8fe45a09",
        "name": "Andrew Kowalski",
        "avatar_md": "https://...",
        "avatar_lg": "https://...",
        "avatarColor": "ffbe42"
    },
    "criterias": [
        {
            "_id": "5da026a580dd3a395f49bd22",
            "name": "Good",
            "team": 4.333333333333333,
            "user": 5
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

/** *****************************************
 * @apiVersion 4.0.0
 * @api {get} /company/:companyId/report-admin Admin dashboard metrics
 * @apiName AdminDashboardMetrics
 * @apiDescription Global engagement metrics
 * @apiGroup Report
 *
 * @apiHeader {String} Authorization* Access token
 *
 * @apiParam (Path parameters) {String} companyId* Company id
 *
 * @apiSuccess (Success Response) {Number} coaches* number of coaches in company
 * @apiSuccess (Success Response) {Number} learners* number of learners in company
 * @apiSuccess (Success Response) {Number} evaluations* number of evaluated practices
 * @apiSuccess (Success Response) {Number} criterias* number of criterias in company
 * @apiSuccess (Success Response) {Number} scenariosInProgress* number of active scenarios in company
 * @apiSuccess (Success Response) {Number} scenariosClosed* number of finished scenarios in company
 * @apiSuccess (Success Response) {Number} messages* number of total messages in company
 * @apiSuccess (Success Response) {Object} avgScore* scenario average score
 * @apiSuccess (Success Response) {Number} avgScore.allPeriod* scenario average score per all period
 * @apiSuccess (Success Response) {Number} avgScore.thisWeek* scenario average score per this week
 * @apiSuccess (Success Response) {Number} avgScore.previousWeek* scenario average score per previous week
 * @apiSuccess (Success Response) {Number} avgScore.thisMonth* scenario average score per thisMonth
 * @apiSuccess (Success Response) {Number} avgScore.previousMonth* scenario average score per previous month
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
{
    "coaches": 5,
    "learners": 6,
    "evaluations": 137,
    "criterias": 5,
    "scenariosInProgress": 140,
    "scenariosClosed": 81,
    "messages": 2403,
    "avgScore": {
        "allPeriod": 3.330701754385965,
        "thisWeek": 4,
        "previousWeek": 0,
        "thisMonth": 2.15625,
        "previousMonth": 3.1923076923076925
    }
}
 * @apiErrorExample {json} FORBIDDEN:
 {
   "code": 403,
   "error": "FORBIDDEN",
   "message": "FORBIDDEN"
 }
 */

/** *****************************************
 * @apiVersion 4.0.0
 * @api {get} /company/:companyId/report-admin/chart Admin dashboard charts
 * @apiName AdminDashboardCharts
 * @apiDescription Learners responsiveness and Scenario length pie charts
 * @apiGroup Report
 *
 * @apiHeader {String} Authorization* Access token
 *
 * @apiParam (Path parameters) {String} companyId* Company id
 *
 * @apiSuccess (Success Response) {Object} scenarioResponsiveness* scenario responsiveness
 * @apiSuccess (Success Response) {Array} scenarioResponsiveness.ranges* responsiveness ranges
 * @apiSuccess (Success Response) {Number} scenarioResponsiveness.ranges.from* from
 * @apiSuccess (Success Response) {Number} scenarioResponsiveness.ranges.to* to
 * @apiSuccess (Success Response) {Number} scenarioResponsiveness.ranges.count* number of scenarios in range
 * @apiSuccess (Success Response) {Array} scenarioResponsiveness.count* number of all scenarios
 * @apiSuccess (Success Response) {Object} scenarioLength* scenario length
 * @apiSuccess (Success Response) {Array} scenarioLength.ranges* length ranges
 * @apiSuccess (Success Response) {Number} scenarioLength.ranges.from* from
 * @apiSuccess (Success Response) {Number} scenarioLength.ranges.to* to
 * @apiSuccess (Success Response) {Number} scenarioLength.ranges.count* number of scenarios in range
 * @apiSuccess (Success Response) {Number} scenarioLength.count* number of all scenarios
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
{
    "scenarioResponsiveness": {
        "ranges": [
            {
                "count": 196
            },
            {
                "to": 1,
                "count": 1
            }
        ],
        "count": 197
    },
    "scenarioLength": {
        "ranges": [
             {
                "from": 1,
                "to": 5,
                "count": 36
            },
            {
                "from": 6,
                "to": 10,
                "count": 5
            }
        ],
        "count": 41
    }
}
 * @apiErrorExample {json} FORBIDDEN:
 {
   "code": 403,
   "error": "FORBIDDEN",
   "message": "FORBIDDEN"
 }
 */
