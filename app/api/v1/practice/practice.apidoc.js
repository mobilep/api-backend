/**
 * @apiVersion 1.0.0
 * @api {get} /company/:companyId/scenario/:scenarioId/practice Get practices
 * @apiName GetPractice
 * @apiDescription List practices of scenario
 * @apiGroup Scenario
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 {
     "_id" : ObjectId("596770f94ff249e719b55354"),
     "_coach" : ObjectId("57fe2450916165b0b8b21111"),
     "_scenario" : ObjectId("574e3a50616165b0b8b55333"),
     "_user" : ObjectId("592b3eef97c0ba1a8ac52132"),
     "updatedAt" : ISODate("2017-07-13T13:09:13.876Z"),
     "__v" : 0,
     "createdAt" : ISODate("2017-07-13T13:09:13.796Z"),
     "userMark" : [],
     "coachMark" : [],
     "status" : "current",
     "chatId" : "https://mp-local-63a73.firebaseio.com/chats/574e3a50616165b0b8b55333/596770f94ff249e719b55354"
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
 * @api {patch} /company/:companyId/scenario/:scenarioId/practice/:practiceId Rate practice
 * @apiName RatePractice
 * @apiDescription Rate Practice
 * @apiGroup Scenario
 * @apiExample {js} Validation
 *
 const schema = joi.object().keys({
    userMark: joi.array().items(joi.object().keys({
      _criteria: joi.string().allow(null),
      mark: joi.number().min(1).max(5)
    })),
    coachMark: joi.array().items(joi.object().keys({
      _criteria: joi.string(),
      mark: joi.number().min(1).max(5)
    }))
  })
 * @apiParamExample {json} Request-Example:
 {
    userMark: [
            {_criteria: null, mark: 3},
            {_criteria: null, mark: 5}
          ]
    // or
    coachMark: [
            {_criteria: '574e3a50616165b0b8b20111', mark: 4},
            {_criteria: '574e3a50616165b0b8b20222', mark: 5}
          ]
 }

 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 {
"_id" : ObjectId("596770f94ff249e719b55354"),
     "_coach" : ObjectId("57fe2450916165b0b8b21111"),
     "_scenario" : ObjectId("574e3a50616165b0b8b55333"),
     "_user" : ObjectId("592b3eef97c0ba1a8ac52132"),
     "updatedAt" : ISODate("2017-07-13T13:09:13.876Z"),
     "__v" : 0,
     "createdAt" : ISODate("2017-07-13T13:09:13.796Z"),
     "userMark: [
            {_criteria: null, mark: 3},
            {_criteria: null, mark: 5}
          ]
     "coachMark" : [],
     "status" : "current",
     "chatId" : "https://mp-local-63a73.firebaseio.com/chats/574e3a50616165b0b8b55333/596770f94ff249e719b55354"
 }
 * @apiErrorExample {json} FORBIDDEN:
 {
   "code": 403,
   "error": "FORBIDDEN",
   "message": "FORBIDDEN"
 }
 */
