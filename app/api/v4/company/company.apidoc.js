/**
 * @apiDefine CompanyDatabaseSchema
 * @apiExample {js} Database Schema
 * {
      name: {
        type: String,
        trim: true,
        required: true
      },
      info: {
        type: String
      },
      sendReminder: {
      type: Number,
      default: 3
      },
      isMailNotification: {
        type: Boolean,
        default: true
      }
      isActive: {type: Boolean, default: true}
 * }
 */

/**
 * @apiDefine CreateCompanyValidation
 * @apiExample {js} Joi Validation
 * joi.object().keys({
    name: joi.string().trim().min(1).max(255).required().regex(utils.Validate.companyName),
    info: joi.string().max(4096).allow(''),
    isMailNotification: joi.boolean(),
    sendReminder: joi.number().integer().min(1).required()
  })
 */

/**
 * @apiDefine EditCompanyValidation
 * @apiExample {js} Joi Validation
 *
 joi.object().keys({
  name: joi.string().trim().min(1).max(255).regex(utils.Validate.companyName),
  info: joi.string().max(4096).allow(''),
  isMailNotification: joi.boolean(),
  sendReminder: joi.number().integer().min(1).allow(null)
})
 */

/**
 * @apiDefine validateInviteUsersToCompany
 * @apiExample {js} Joi Validation
 * joi.array().items(joi.object().keys({
    firstName: joi.string().min(1).max(30).required(),
    lastName: joi.string().min(1).max(30).required(),
    email: joi.string().min(1).required().regex(utils.Validate.email),
    country: joi.string().min(1).required(),
    lang: joi.string().min(1).required(),
    postcode: joi.string().trim().min(1).max(30).required().allow(''),
    extraInformation: joi.array().items(joi.object().keys({
      title: joi.string().min(1).max(30),
      description: joi.string().min(1).max(30)
    })),
    password: joi.string().min(6).max(30).regex(utils.Validate.password),
    isCompanyAdmin: joi.boolean()
  })).allow(null)
 */

/**
 * @apiVersion 4.0.0
 * @api {post} /company Create company
 * @apiName PostCompany
 * @apiDescription Create company and company admin
 * @apiGroup Company
 * @apiHeader {String} Authorization* Access token
 * @apiUse CompanyDatabaseSchema
 * @apiUse CreateCompanyValidation
 * @apiParamExample {json} Request-Example:
 *     {
 *       "name": "Techmagic",
 *       "info": "it company", // optional,
 *       "sendReminder": 4,
 *       "isMailNotificatio": true
 *     }

 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 {
   "name": "Techmagic",
   "info": "it company",
   "sendReminder": 4,
   "isMailNotificatio": true
   "_id": "592b3b608cd6291923e74ac2"
 }
 * @apiErrorExample {json} Bad Request:
 {
   "code": 400,
   "error": "BAD_REQUEST",
   "message": "\"password\" is required; "
 }
 */

/** ---------------------------------------------------------------------------------------------------------------------------------- **/

/**
 * @apiVersion 4.0.0
 * @api {post} /company/:companyId/user Invite user(s) to company
 * @apiName PostCompanyUsers
 * @apiDescription Invite not admins to the company
 * @apiGroup Company
 * @apiHeader {String} Authorization* Access token
 * @apiUse validateInviteUsersToCompany
 * @apiParamExample {json} Request-Example:
 [{
    "firstName": "nikita",
    "lastName": "pankiv",
    "email": "nikita@techmagic.co",
    "country": "france",
    "lang": "french",
    "postcode": "12345",
    "extraInformation": [{"title": "Info", description: "something about user"}], // optional
    "isCompanyAdmin": true, // optional
    "password": "********" // only if isCompanyAdmin = true
 }]

 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 [{
    "_id": "592b3eef97c0ba1a8ac5213b",
    "isCompanyAdmin": false,
    "isSysAdmin": false,
    "email": "nikita@techmagic.co"
    "_company": "592b3eef97c0ba1a8ac52qqq"
    "country": "france", // optional
    "lang": "french", // optional
    "postcode": "12345", // optional
    "extraInformation": [{"title": "Info", description: "something about user"}], // optional
    "isCompanyAdmin": true, // optional
 }]
 * @apiErrorExample {json} FORBIDDEN:
 {
   "code": 403,
   "error": "FORBIDDEN",
   "message": "FORBIDDEN"
 }
 */

/** ---------------------------------------------------------------------------------------------------------------------------------- **/

/**
 * @apiVersion 4.0.0
 * @api {get} /company/:companyId Get company info
 * @apiName GetCompany
 * @apiHeader {String} Authorization* Access token
 * @apiDescription Get company info
 * @apiUse CompanyDatabaseSchema
 * @apiGroup Company
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 {
     "name": "Techmagic"
  }
 * @apiErrorExample {json} FORBIDDEN:
 {
   "code": 403,
   "error": "FORBIDDEN",
   "message": "FORBIDDEN"
 }
 */

/** ---------------------------------------------------------------------------------------------------------------------------------- **/

/**
 * @apiVersion 4.0.0
 * @api {patch} /company/:companyId Edit company details
 * @apiName PatchCompany
 * @apiDescription edit company details
 * @apiGroup Company
 * @apiHeader {String} Authorization* Access token
 * @apiUse CompanyDatabaseSchema
 * @apiUse EditCompanyValidation
 * @apiParamExample {json} Request-Example:
 *     {
 *       "name": "Techmagic",
 *       "info": "it company",
 *       "sendReminder": 4
 *       "isMailNotification": true
 *     }

 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 {
   "name": "Techmagic",
   "info": "it company",
   "sendReminder": 4,
   "isMailNotification": true
   "_id": "592b3b608cd6291923e74ac2"
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
 * @api {delete} /company/:companyId Delete company
 * @apiName DeleteCompany
 * @apiDescription Delete company
 * @apiGroup Company
 * @apiHeader {String} Authorization* Access token

 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 {
     "_id": "592b3eef97c0ba1a8ac5213b",
     "name": "techmagic",
     "isActive": false
  }
 * @apiErrorExample {json} FORBIDDEN:
 {
   "code": 403,
   "error": "FORBIDDEN",
   "message": "FORBIDDEN"
 }
 */

/** ---------------------------------------------------------------------------------------------------------------------------------- **/

/**
 * @apiVersion 4.0.0
 * @api {get} /company/ Get all companies
 * @apiName GetCompanies
 * @apiDescription Get all companies if user is sys admin
 * @apiGroup Company
 * @apiHeader {String} Authorization* Access token
 * @apiUse CompanyDatabaseSchema
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 [{
    "_id": "592b3eef97c0ba1a8ac5213b,
    "name": "Techmagic"
  },
 {
   "_id": "592b3eef97c0ba1a8ac5213v",
   "name": "Google"
 },
 ]
 * @apiErrorExample {json} FORBIDDEN:
 {
   "code": 403,
   "error": "FORBIDDEN",
   "message": "FORBIDDEN"
 }
 */

/** ------------------------------------------------------------------------- **/

/**
 * @apiVersion 4.0.0
 * @api {post} /company/:companyId/invite Send invite email to user(s)
 * @apiName PostCompanyUsersInvite
 * @apiDescription Send invite email to user(s)
 * @apiGroup Company
 * @apiHeader {String} Authorization* Access token
 * @apiParamExample {json} Request-Example:
 [ "592b3eef97c0ba1a8ac5213b", "592b3eef97c0ba1a8ac5333"]

 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 [{
    "_id": "592b3eef97c0ba1a8ac5213b",
    "isCompanyAdmin": false,
    "isSysAdmin": false,
    "email": "nikita@techmagic.co"
    "_company": "592b3eef97c0ba1a8ac52qqq"
 },
 {
    "_id": "592b3eef97c0ba1a8ac5333",
    "isCompanyAdmin": false,
    "isSysAdmin": false,
    "email": "ivan@techmagic.co"
    "_company": "592b3eef97c0ba1a8ac52qqq"
 }]
 * @apiErrorExample {json} FORBIDDEN:
 {
   "code": 403,
   "error": "FORBIDDEN",
   "message": "FORBIDDEN"
 }
 */

/** ------------------------------------------------------------------------- **/

/**
 * @apiVersion 4.0.0
 * @api {post} /company/:companyId/sendTestEmail Send test email
 * @apiName PostCompanyTestEmail
 * @apiDescription Send test email
 * @apiGroup Company
 * @apiHeader {String} Authorization* Access token
 * @apiParamExample {json} Request-Example:
 {
  email: "john.doe@awesome.com"
 }

 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 204 OK

 * @apiErrorExample {json} FORBIDDEN:
 {
   "code": 403,
   "error": "FORBIDDEN",
   "message": "FORBIDDEN"
 }
 */

/**
 * @apiVersion 4.0.0
 * @api {post} /company/:companyId/import Import users CSV
 * @apiName ImportCSV
 * @apiDescription Import CSV with users
 * @apiGroup Company
 * @apiHeader {String} Authorization* Access token
 * @apiParamExample {json} Request-Example:
 {
  importCsvFile: (file)
 }

 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 204 OK

 * @apiErrorExample {json} FORBIDDEN:
 {
   "code": 403,
   "error": "FORBIDDEN",
   "message": "FORBIDDEN"
 }
 */

/**
 * @apiVersion 4.0.0
 * @api {get} /company/:companyId/importStatus Import status of CSV
 * @apiName ImportStatusCSV
 * @apiDescription Import status events of CSV upload
 * @apiGroup Company
 * @apiParam (Query parameters) {String} Authorization* auth token
 * @apiSuccessExample {json} Success-Response:
 * {
 *  status: finished,
 *  result: {
 *    addedUsers:[],
 *    issues:[],
 *    failedUsers:[]
 *  }
 * }

 * @apiErrorExample {json} FORBIDDEN:
 {
   "code": 403,
   "error": "FORBIDDEN",
   "message": "FORBIDDEN"
 }
 */
