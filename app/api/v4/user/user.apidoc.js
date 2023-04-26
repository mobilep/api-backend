'use strict'
/**
 * @apiVersion 4.0.0
 * @api {get} /user Get current user information
 * @apiName GetUserMe
 * @apiDescription Get current user information
 * @apiGroup User
 * @apiHeader {String} Authorization* Access token

 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 {
   "_company": "592b3b608cd6291923e74ac1",
   "_id": "592b3b608cd6291923e74ac2",
   "isCompanyAdmin": true,
   "isSysAdmin": false,
   "email": "mike@company.com",
   "lastName": "Mike",
   "firstName": "King"
 }
 * @apiErrorExample {json} Bad Request:
 {
   "code": 400,
   "error": "BAD_REQUEST",
   "message": "BAD_REQUEST"
 }
 */

// -----------------------------------------------------------------

/**
 * @apiVersion 4.0.0
 * @api {post} /sysadmin/** Create sysAdmin
 * @apiName PostSysAdmin
 * @apiDescription Create sysAdmin
 * @apiGroup SysAdmin
 * @apiParamExample {json} Request-Example:
 *     {
 *       "firstName": "Mike",
 *       "lastName": "King",
 *       "email": "admin@techmagic.co",
 *       "password": "*********"
 *     }

 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 {
   "_id": "592b3b608cd6291923e74ac2",
   "isCompanyAdmin": false,
   "isSysAdmin": true,
   "email": "admin@techmagic.co",
   "lastName": "Mike",
   "firstName": "King"
 }
 */

// -----------------------------------------------------------------

/**
 * @apiVersion 4.0.0
 * @api {get} /company/:companyId/user Get users in company
 * @apiName GetUserCompany
 * @apiDescription get users in company
 * @apiGroup User
 * @apiHeader {String} Authorization* Access token

 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 [{
    "_id": "592b3eef97c0ba1a8ac5213b",
    "isCompanyAdmin": false,
    "isSysAdmin": false,
    "email": "nikita@techmagic.co"
    "_company": "592b3eef97c0ba1a8ac52qqq"
    "country": "france",
    "lang": "french",
    "postcode": "12345",
    "extraInformation": [{"title": "Info", description: "something about user"}], // optional
    "isCompanyAdmin": true,
    "isCoach": true
 }]
 * @apiErrorExample {json} FORBIDDEN:
 {
   "code": 403,
   "error": "FORBIDDEN",
   "message": "FORBIDDEN"
 }
 */

// -----------------------------------------------------------------

/**
 * @apiVersion 4.0.0
 * @api {get} /company/:companyId/user?filter=abc Filter users in company
 * @apiName FilterUserCompany
 * @apiDescription filter users in company
 * @apiGroup User
 * @apiHeader {String} Authorization* Access token

 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 [{
    "_id": "592b3eef97c0ba1a8ac5213b",
    "_company": "592b3eef97c0ba1a8ac52qqq"
    "firstName": "abc",
    "lastName": "abc",
    "name": "abc abc",
    "avatarColor": "123456",
    "avatarId": "4444-4444-4444"
 }]
 * @apiErrorExample {json} FORBIDDEN:
 {
   "code": 403,
   "error": "FORBIDDEN",
   "message": "FORBIDDEN"
 }
 */

// -----------------------------------------------------------------

/**
 * @apiVersion 4.0.0
 * @api {get} /company/:companyId/user/:userId Get user info
 * @apiName GetUserInfo
 * @apiDescription get user info
 * @apiGroup User
 * @apiHeader {String} Authorization* Access token

 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 {
     "_id": "592b3eef97c0ba1a8ac5213b",
     "isCompanyAdmin": false,
     "isSysAdmin": false,
     "email": "nikita@techmagic.co"
     "_company": "592b3eef97c0ba1a8ac52qqq"
     "country": "france",
     "lang": "french",
     "postcode": "12345",
     "details": [
       {"title": "Info title", "description": "something about user"}
     ],
     "isCompanyAdmin": true,
     "_coach": "john@gmail.com"
  }
 * @apiErrorExample {json} FORBIDDEN:
 {
   "code": 403,
   "error": "FORBIDDEN",
   "message": "FORBIDDEN"
 }
 */

// -----------------------------------------------------------------

/**
 * @apiVersion 4.0.0
 * @api {delete} /company/:companyId/user/:userId Delete user
 * @apiName DeleteUser
 * @apiDescription delete user
 * @apiGroup User
 * @apiHeader {String} Authorization* Access token

 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 {
     "_id": "592b3eef97c0ba1a8ac5213b",
     "isCompanyAdmin": false,
     "isSysAdmin": false,
     "email": "nikita@techmagic.co"
     "_company": "592b3eef97c0ba1a8ac52qqq"
     "country": "france",
     "lang": "french",
     "postcode": "12345",
     "extraInformation": [{"title": "Info", description: "something about user"}], // optional
     "isCompanyAdmin": true,
     "isActive": false
  }
 * @apiErrorExample {json} FORBIDDEN:
 {
   "code": 403,
   "error": "FORBIDDEN",
   "message": "FORBIDDEN"
 }
 */

// -----------------------------------------------------------------

/**
 * @apiVersion 4.0.0
 * @api {patch} /company/:companyId/user Delete users
 * @apiName DeleteUsers
 * @apiDescription delete users
 * @apiGroup User
 * @apiHeader {String} Authorization* Access token
 * @apiParamExample {json} Request-Example:
 * [
 *    {_id: "592b3eef97c0ba1a8ac5213b", isActive: false},
 *    {_id: "592b3eef97c0ba1a8ac5214b", isActive: false}
 * ]
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 204 OK No Content
 * @apiErrorExample {json} FORBIDDEN:
 {
   "code": 403,
   "error": "FORBIDDEN",
   "message": "FORBIDDEN"
 }
 */

// -----------------------------------------------------------------

/**
 * @apiVersion 4.0.0
 * @api {patch} /company/:companyId/user/:userId Edit user
 * @apiName PatchUser
 * @apiDescription Edit user
 * @apiGroup User
 * @apiHeader {String} Authorization* Access token
 * @apiParamExample {json} Request-Example:
 * {
     "firstName": "nikita",
     "lastName": "king",
     "email": "nikita@techmagic.co"
     "country": "france",
     "lang": "french",
     "postcode": "12345",
     "avatarId": "EB554C06-9ABC-48B7-BC8F-C8C2E258C641", // unique guid
     "avatarColor": "e4e5e8",
     "_coach": "john@gmail.com",
 * }
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 {
     "_id": "592b3eef97c0ba1a8ac5213b",
     "firstName": "nikita",
     "lastName": "king",
     "email": "nikita@techmagic.co"
     "country": "france",
     "lang": "french",
     "postcode": "12345",
     "avatarId": "EB554C06-9ABC-48B7-BC8F-C8C2E258C641",
     "avatarColor": "e4e5e8",
     "_coach": "john@gmail.com",
     "avatar_sm": "https://s3-eu-west-1.amazonaws.com/mobilepractice-photo/public/100/EB554C06-9ABC-48B7-BC8F-C8C2E258C641.jpg?time=1496617592811",
     "avatar_md": "https://s3-eu-west-1.amazonaws.com/mobilepractice-photo/public/640/EB554C06-9ABC-48B7-BC8F-C8C2E258C641.jpg?time=1496617592811",
     "avatar_lg": "https://s3-eu-west-1.amazonaws.com/mobilepractice-photo/public/1024/EB554C06-9ABC-48B7-BC8F-C8C2E258C641.jpg?time=1496617592811",
  }
 * @apiErrorExample {json} FORBIDDEN:
 {
   "code": 403,
   "error": "FORBIDDEN",
   "message": "FORBIDDEN"
 }
 */
