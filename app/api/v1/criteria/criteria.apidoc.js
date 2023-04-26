'use strict'

/**
 * @apiVersion 1.0.0
 * @api {post} /company/:companyId/criteria Create practice criteria
 * @apiName PostCriteria
 * @apiDescription Create practice criteria for the company
 * @apiGroup Criteria
 * @apiParamExample {json} Request-Example:
 *     {
 *       "name": "Introduction",
 *       "info": "Introduction must be clear" // optional
 *     }

 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 {
   "name": "Introduction",
   "info": "Introduction must be clear",
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
 * @apiVersion 1.0.0
 * @api {patch} /company/:companyId/criteria/:criteriaId Update practice criteria
 * @apiName PatchCriteria
 * @apiDescription Update practice criteria for the company
 * @apiGroup Criteria
 * @apiParamExample {json} Request-Example:
 *     {
 *       "name": "Introduction",
 *       "info": "Introduction must be clear"
 *     }

 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 {
   "name": "Introduction",
   "info": "Introduction must be clear",
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
 * @apiVersion 1.0.0
 * @api {delete} /company/:companyId/criteria/:criteriaId Delete practice criteria
 * @apiName DeleteCriteria
 * @apiDescription Delete practice criteria for the company
 * @apiGroup Criteria

 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 {
   "name": "Introduction",
   "info": "Introduction must be clear",
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
 * @apiVersion 1.0.0
 * @api {get} /company/:companyId/criteria Get list of practice criterias
 * @apiName getCriteria
 * @apiDescription Get list of practice criterias
 * @apiGroup Criteria

 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 [{
   "name": "Introduction",
   "info": "Introduction must be clear",
   "_id": "592b3b608cd6291923e74ac2"
 },
 {
   "name": "Ending",
   "info": "Ending must be clear",
   "_id": "592b3b608cd6291923e74ac2"
 }]
 * @apiErrorExample {json} Bad Request:
 {
   "code": 400,
   "error": "BAD_REQUEST"
 }
 */
