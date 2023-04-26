'use strict'

/**
 * @apiVersion 4.0.0
 * @api {post} /company/:companyId/team Create team
 * @apiName PostTeam
 * @apiDescription Create team for the company
 * @apiGroup Teams
 * @apiHeader {String} Authorization* Access token
 * @apiParamExample {json} Request-Example:
 *     {
 *       "name": "Introduction",
 *       "_users": ["592b3eef97c0ba1a8ac52131", "592b3eef97c0ba1a8ac52132"] // optional
 *     }

 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 {
   "name": "Introduction",
   "_users": "Introduction must be clear",
   "_id": "592b3b608cd6291923e74ac2"
 }
 * @apiErrorExample {json} Bad Request:
 {
   "code": 400,
   "error": "BAD_REQUEST"
 }
 */

/** ---------------------------------------------------------------------------------------------------------------------------------- **/

/**
 * @apiVersion 4.0.0
 * @api {patch} /company/:companyId/team/:teamId Update team
 * @apiName PatchTeam
 * @apiDescription Update team for the company
 * @apiGroup Teams
 * @apiHeader {String} Authorization* Access token
 * @apiParamExample {json} Request-Example:
 *     {
 *       "name": "Introduction",
 *       "_users": ["592b3eef97c0ba1a8ac52131", "592b3eef97c0ba1a8ac52132"]
 *     }

 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 {
   "name": "Introduction",
   "_users": "Introduction must be clear",
   "_id": "592b3b608cd6291923e74ac2"
 }
 * @apiErrorExample {json} Bad Request:
 {
   "code": 400,
   "error": "BAD_REQUEST"
 }
 */

/** ---------------------------------------------------------------------------------------------------------------------------------- **/

/**
 * @apiVersion 4.0.0
 * @api {delete} /company/:companyId/team/:teamId Delete team
 * @apiName DeleteTeam
 * @apiDescription Delete team for the company
 * @apiGroup Teams
 * @apiHeader {String} Authorization* Access token

 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 {
   "name": "Introduction",
   "_users": ["592b3eef97c0ba1a8ac52131", "592b3eef97c0ba1a8ac52132"],
   "_id": "592b3b608cd6291923e74ac2"
 }
 * @apiErrorExample {json} Bad Request:
 {
   "code": 400,
   "error": "BAD_REQUEST"
 }
 */

/** ---------------------------------------------------------------------------------------------------------------------------------- **/

/**
 * @apiVersion 4.0.0
 * @api {get} /company/:companyId/team Get list of teams
 * @apiName getTeams
 * @apiDescription Get list of teams
 * @apiGroup Teams
 * @apiHeader {String} Authorization* Access token

 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 [{
   "name": "Introduction",
   "_users": ["592b3eef97c0ba1a8ac52131", "592b3eef97c0ba1a8ac52132"],
   "_id": "592b3b608cd6291923e74ac2"
 },
 {
   "name": "Ending",
   "_users": ["592b3eef97c0ba1a8ac52131", "592b3eef97c0ba1a8ac52132"],
   "_id": "592b3b608cd6291923e74ac2"
 }]
 * @apiErrorExample {json} Bad Request:
 {
   "code": 400,
   "error": "BAD_REQUEST"
 }
 */

/**
 * @apiVersion 4.0.0
 * @api {get} /company/:companyId/team/teamId Get one team
 * @apiName getTeam
 * @apiDescription Get list of teams
 * @apiGroup Teams
 * @apiHeader {String} Authorization* Access token

 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 {
   "name": "Introduction",
   "_users": ["592b3eef97c0ba1a8ac52131", "592b3eef97c0ba1a8ac52132"],
   "_id": "592b3b608cd6291923e74ac2"
 }
 * @apiErrorExample {json} Bad Request:
 {
   "code": 400,
   "error": "BAD_REQUEST"
 }
 */
