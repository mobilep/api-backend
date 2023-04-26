'use strict'
/**
 * @apiVersion 1.0.0
 * @api {put} /auth User sign in
 * @apiName PutAuth
 * @apiDescription User sign in with password or magic link
 * @apiGroup Auth
 * @apiParamExample {json} Request-Example:
 *     {
 *       "email": "mike@company.com",
 *       "password": "***" // optional, if not provided than Magic Link will be send on email
 *     }

 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 {
    "_company": "592b3e9b97c0ba1a8ac52139",
    "isCompanyAdmin": false,
    "isSysAdmin": false,
    "email": "mike@company.com",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1OTJiM2U5Yjk3YzBiYTFhOGFjNTIxM2EiLCJpYXQiOjE0OTYwMDY1OTksImV4cCI6MTQ5ODU5ODU5OX0.ZYd1H66j925S1ZamONQQx-Dxo46A9TA8JbjN0LET8pk"
 }
 * @apiErrorExample {json} Bad Request:
 {
   "code": 400,
   "error": "BAD_REQUEST",
   "message": "BAD_REQUEST"
 }
 */

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

/**
 * @apiVersion 1.0.0
 * @api {post} /auth/forgot-password Request forgot password
 * @apiName PutAuthFP
 * @apiDescription Request forgot password will be send link on email
 * @apiGroup Auth
 * @apiParamExample {json} Request-Example:
 *     {
 *       "email": "mike@company.com"
 *     }

 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 {
   "_id": "59300ba3a697680baf417b1b",
   "isSysAdmin": false,
   "isCompanyAdmin": true,
   "email": "mike@company.com",
   "lastName": "King",
   "firstName": "Mike"
 }
 * @apiErrorExample {json} Bad Request:
 {
   "code": 400,
   "error": "BAD_REQUEST",
   "message": "BAD_REQUEST"
 }
 */
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

/**
 * @apiVersion 1.0.0
 * @api {post} /auth/client-forgot-password Client Request forgot password
 * @apiName PutAuthFP
 * @apiDescription Request forgot password will be send link on email
 * @apiGroup Auth
 * @apiParamExample {json} Request-Example:
 *     {
 *       "email": "mike@company.com"
 *     }

 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 {
   "_id": "59300ba3a697680baf417b1b",
   "isSysAdmin": false,
   "isCompanyAdmin": true,
   "email": "mike@company.com",
   "lastName": "King",
   "firstName": "Mike"
 }
 * @apiErrorExample {json} Bad Request:
 {
   "code": 400,
   "error": "BAD_REQUEST",
   "message": "BAD_REQUEST"
 }
 */
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

/**
 * @apiVersion 1.0.0
 * @api {post} /auth/new-password Submit new password
 * @apiName PutAuthNP
 * @apiDescription Submit new password - after user clicked on email forgot password
 * @apiGroup Auth
 * @apiParamExample {json} Request-Example:
 *     {
 *       "password": "*******"
 *     }

 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 {
   "_id": "59300ba3a697680baf417b1b",
   "isSysAdmin": false,
   "isCompanyAdmin": true,
   "email": "mike@company.com",
   "lastName": "King",
   "firstName": "Mike"
 }
 * @apiErrorExample {json} Bad Request:
 {
   "code": 400,
   "error": "BAD_REQUEST",
   "message": "BAD_REQUEST"
 }
 */

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

/**
 * @apiVersion 1.0.0
 * @api {post} /auth/create-password Create new password
 * @apiName PutAuthCreatePassword
 * @apiDescription Submit new password - after user clicked on email create password
 * @apiGroup Auth
 * @apiParamExample {json} Request-Example:
 *     {
 *       "password": "*******"
 *     }

 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 {
   "_id": "59300ba3a697680baf417b1b",
   "isSysAdmin": false,
   "isCompanyAdmin": true,
   "email": "mike@company.com",
   "lastName": "King",
   "firstName": "Mike"
 }
 * @apiErrorExample {json} Bad Request:
 {
   "code": 400,
   "error": "BAD_REQUEST",
   "message": "BAD_REQUEST"
 }
 */
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

/**
 * @apiVersion 1.0.0
 * @api {post} /auth/change-password Change password
 * @apiName PutAuthCP
 * @apiDescription change password
 * @apiGroup Auth
 * @apiParamExample {json} Request-Example:
 *     {
 *       "oldPassword": "*******"
 *       "newPassword": "*******"
 *     }

 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 {
   "_id": "59300ba3a697680baf417b1b",
   "isSysAdmin": false,
   "isCompanyAdmin": true,
   "email": "mike@company.com",
   "lastName": "King",
   "firstName": "Mike"
 }
 * @apiErrorExample {json} Bad Request:
 {
   "code": 400,
   "error": "BAD_REQUEST",
   "message": "BAD_REQUEST"
 }
 */
