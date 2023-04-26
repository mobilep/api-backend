'use strict'

const joi = require('joi')
const moment = require('moment')
const ObjectId = require('mongoose').Types.ObjectId

module.exports.validateReportQuery = (query) => {
  const schema = joi.object().keys({
    from: joi.date().timestamp(),
    to: joi.date().timestamp()
  }).unknown(true)

  const result = joi.validate(query, schema)
  if (result.coach) {
    if (!ObjectId.isValid(result.coach)) {
      throw utils.ErrorHelper.badRequest('ERROR_INVALID_USER')
    }
  }
  if (result.error) {
    throw utils.ErrorHelper.invalidJoi(result.error)
  }
  return result.value
}

module.exports.timeRange = () => {
  const dateNow = moment()
  const beginOfWeek = dateNow.clone().subtract(7, 'd')
  const beginOfPreviousWeek = beginOfWeek.clone().subtract(7, 'd')
  const beginOfMonth = dateNow.clone().subtract(30, 'd')
  const beginOfPreviousMonth = beginOfMonth.clone().subtract(30, 'd')

  const thisWeek = {userEvaluatedAt: {$gt: beginOfWeek.toDate(), $lt: dateNow.toDate()}}
  const previousWeek = {userEvaluatedAt: {$gt: beginOfPreviousWeek.toDate(), $lt: beginOfWeek.toDate()}}
  const thisMonth = {userEvaluatedAt: {$gt: beginOfMonth.toDate(), $lt: dateNow.toDate()}}
  const previousMonth = {userEvaluatedAt: {$gt: beginOfPreviousMonth.toDate(), $lt: beginOfMonth.toDate()}}

  return {thisWeek, thisMonth, previousWeek, previousMonth}
}
