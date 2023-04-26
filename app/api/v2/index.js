'use strict'

const express = require('express')
const authController = require('./../v1/auth/auth.controller')
const authMiddleware = require('./../v1/auth/auth.middleware')
const userController = require('./../v1/user/user.controller')
const userMiddleware = require('./../v1/user/user.middleware')
const companyController = require('./../v1/company/company.controller')
const systemController = require('./../v1/system/system.controller')
const companyMiddleware = require('./../v1/company/company.middleware')
const criteriaController = require('./../v1/criteria/criteria.controller')
const scenarioController = require('./../v1/scenario/scenario.controller')
const practiceController = require('./../v1/practice/practice.controller')
const inboxController = require('./../v1/inbox/inbox.controller')
const teamController = require('./../v1/team/team.controller')
const practiceMiddleware = require('./../v1/practice/practice.middleware')
const scenarioMiddleware = require('./../v1/scenario/scenario.middleware')
const teamMiddleware = require('./../v1/team/team.middleware')
const inboxMiddleware = require('./../v1/inbox/inbox.middleware')
const uploadController = require('./../v1/upload/upload.controller')
const specMiddleware = require('./../v1/spec/spec.middleware')
const specController = require('./../v1/spec/spec.controller')

const ObjectId = require('mongoose').Types.ObjectId

const router = express.Router()

router.param('companyId', (req, res, next, id) => {
  if (!ObjectId.isValid(id)) {
    return next(utils.ErrorHelper.badRequest('ERROR_INVALID_COMPANY'))
  }
  next()
})

router.param('userId', (req, res, next, id) => {
  if (!ObjectId.isValid(id)) {
    return next(utils.ErrorHelper.badRequest('ERROR_INVALID_USER'))
  }
  next()
})

router.param('criteriaId', (req, res, next, id) => {
  if (!ObjectId.isValid(id)) {
    return next(utils.ErrorHelper.badRequest('ERROR_INVALID_CRITERIA'))
  }
  next()
})

router.param('scenarioId', (req, res, next, id) => {
  if (!ObjectId.isValid(id)) {
    return next(utils.ErrorHelper.badRequest('ERROR_INVALID_SCENARIO'))
  }
  next()
})

router.param('practiceId', (req, res, next, id) => {
  if (!ObjectId.isValid(id)) {
    return next(utils.ErrorHelper.badRequest('ERROR_INVALID_PRACTICE'))
  }
  next()
})

router.param('inboxId', (req, res, next, id) => {
  if (!ObjectId.isValid(id)) {
    return next(utils.ErrorHelper.badRequest('ERROR_INVALID_INBOX'))
  }
  next()
})

router.param('teamId', (req, res, next, id) => {
  if (!ObjectId.isValid(id)) {
    return next(utils.ErrorHelper.badRequest('ERROR_INVALID_TEAM'))
  }
  next()
})

/***************************************************************************
 *  SYSTEM
 ***************************************************************************/
router.get('/system/aws', authMiddleware.checkAuthToken, systemController.aws)
router.get('/system/healthcheck', (req, res, next) => res.send('OK'))
/***************************************************************************
 *  USER
 ***************************************************************************/
// Disable creating sys-admin for security reasons
// router.post('/sysadmin/4172C65B-E6AE-4C51-B0B1-92A313E63810', userController.createSysAdmin)
router.put('/auth', authController.signin)
router.get('/auth/magic', authController.signinMagic)
router.get('/user', authMiddleware.checkAuthToken, userController.getMe)
router.patch('/user', authMiddleware.checkAuthToken, userController.editMe)
router.post('/user/device', authMiddleware.checkAuthToken, userController.registerDevice)
router.delete('/user/device/:token', authMiddleware.checkAuthToken, userController.deregisterDevice)
router.delete('/user/:userId', authMiddleware.checkAuthToken, userController.deleteMyself)
router.post('/auth/forgot-password', authController.requestForgotPass)
router.post('/auth/client-forgot-password', authController.requestClientForgotPass)
router.post('/auth/new-password', authMiddleware.checkResetToken, authController.newPass)
router.post('/auth/create-password', authMiddleware.checkResetToken, authController.createNewPass)
router.post('/auth/change-password', authMiddleware.checkAuthToken,
  authController.changePass)

/***************************************************************************
 *  COMPANY
 ***************************************************************************/

router.post('/company', authMiddleware.checkAuthToken,
  userMiddleware.checkSysAdmin, companyController.create)
router.get('/company/:companyId', authMiddleware.checkAuthToken,
  companyMiddleware.checkCompanyUser, companyController.get)
router.patch('/company/:companyId', authMiddleware.checkAuthToken,
  companyMiddleware.checkCompanyAdmin, companyController.edit)
router.delete('/company/:companyId', authMiddleware.checkAuthToken,
  userMiddleware.checkSysAdmin, companyController.delete)
router.get('/company', authMiddleware.checkAuthToken,
  userMiddleware.checkSysAdmin, companyController.getAll)

router.get('/company/:companyId/user',
  authMiddleware.checkAuthToken,
  companyMiddleware.checkCompanyUser,
  userController.getUsers)

router.get('/company/:companyId/user/:userId',
  authMiddleware.checkAuthToken,
  companyMiddleware.checkCompanyUser,
  userController.getUser)

router.patch('/company/:companyId/user/:userId',
  authMiddleware.checkAuthToken,
  companyMiddleware.checkCompanyAdminOrMe,
  userController.editUser)

router.patch('/company/:companyId/user',
  authMiddleware.checkAuthToken,
  companyMiddleware.checkCompanyAdmin,
  userController.deleteUsers)

router.delete('/company/:companyId/user/:userId',
  authMiddleware.checkAuthToken,
  companyMiddleware.checkCompanyAdmin,
  userController.deleteUser)

router.post('/company/:companyId/user',
  authMiddleware.checkAuthToken,
  companyMiddleware.checkCompanyAdmin,
  companyController.inviteUsers)

router.post('/company/:companyId/invite',
  authMiddleware.checkAuthToken,
  companyMiddleware.checkCompanyAdmin,
  companyController.sendInvite)

router.post('/company/:companyId/sendTestEmail',
  authMiddleware.checkAuthToken,
  companyMiddleware.checkCompanyAdmin,
  companyController.sendTestEmail)

router.post('/company/:companyId/import', authMiddleware.checkAuthToken, companyMiddleware.checkCompanyAdmin, companyController.import)

/***************************************************************************
 *  CRITERIA
 ***************************************************************************/

router.post('/company/:companyId/criteria', authMiddleware.checkAuthToken,
  companyMiddleware.checkCompanyUser, criteriaController.create)
router.get('/criteria', criteriaController.getUserCriterias)
router.get('/company/:companyId/criteria', authMiddleware.checkAuthToken,
  companyMiddleware.checkCompanyUser, criteriaController.get)
router.patch('/company/:companyId/criteria/:criteriaId',
  authMiddleware.checkAuthToken, companyMiddleware.checkCompanyUser,
  criteriaController.edit)
router.delete('/company/:companyId/criteria/:criteriaId',
  authMiddleware.checkAuthToken, companyMiddleware.checkCompanyUser,
  criteriaController.delete)

/***************************************************************************
 *  PRACTICE
 ***************************************************************************/
router.get('/company/:companyId/scenario/:scenarioId/practice',
  authMiddleware.checkAuthToken, companyMiddleware.checkCompanyUser,
  practiceMiddleware.checkAccessToScenario, practiceController.get)
router.patch('/company/:companyId/scenario/:scenarioId/practice/:practiceId',
  authMiddleware.checkAuthToken, companyMiddleware.checkCompanyUser,
  practiceController.edit)
router.post('/company/:companyId/scenario/:scenarioId/practice/:practiceId/inbox/:inboxId',
  authMiddleware.checkAuthToken,
  companyMiddleware.checkCompanyUser,
  practiceMiddleware.checkAccess,
  inboxMiddleware.checkInboxOwner,
  practiceController.postMessage)
router.get('/:companyId/export',
  authMiddleware.checkQueryToken,
  companyMiddleware.checkCompanyUser,
  practiceController.export)

/***************************************************************************
 *  SCENARIO
 ***************************************************************************/

router.post('/company/:companyId/scenario', authMiddleware.checkAuthToken,
  companyMiddleware.checkCompanyUser, scenarioController.create)
router.post('/company/:companyId/scenario/:scenarioId/examples', authMiddleware.checkAuthToken,
  companyMiddleware.checkCompanyUser, scenarioMiddleware.checkCoach, scenarioController.pushBestPractice)
router.patch('/company/:companyId/scenario/:scenarioId',
  authMiddleware.checkAuthToken, scenarioMiddleware.checkCoach,
  scenarioController.edit)
router.get('/company/:companyId/scenario', authMiddleware.checkAuthToken,
  companyMiddleware.checkCompanyUser, scenarioController.get)
router.delete('/company/:companyId/scenario/:scenarioId',
  authMiddleware.checkAuthToken, companyMiddleware.checkCompanyUser,
  scenarioMiddleware.checkCoach, scenarioController.delete)

router.get('/company/:companyId/admin-scenario',
  authMiddleware.checkAuthToken,
  userMiddleware.checkAdmin,
  companyMiddleware.checkCompanyAdmin,
  scenarioController.getAdminScenario)

router.get('/company/:companyId/admin-scenario/:scenarioId',
  authMiddleware.checkAuthToken,
  userMiddleware.checkAdmin,
  companyMiddleware.checkCompanyAdmin,
  scenarioController.getAdminScenarioDetails)

router.get('/company/:companyId/admin-scenario/:scenarioId/practice',
  authMiddleware.checkAuthToken,
  userMiddleware.checkAdmin,
  companyMiddleware.checkCompanyAdmin,
  scenarioController.getAdminScenarioPractices)

router.get('/company/:companyId/admin-scenario/:scenarioId/practice/:practiceId',
  authMiddleware.checkAuthToken,
  userMiddleware.checkAdmin,
  companyMiddleware.checkCompanyAdmin,
  scenarioController.getPracticeMessages)

/***************************************************************************
 *  INBOX
 ***************************************************************************/

router.post('/company/:companyId/inbox', authMiddleware.checkAuthToken,
  companyMiddleware.checkCompanyUser, inboxController.create)
router.get('/company/:companyId/inbox', authMiddleware.checkAuthToken,
  companyMiddleware.checkCompanyUser, inboxController.getAllV2)
router.get('/company/:companyId/inbox/:inboxId', authMiddleware.checkAuthToken, companyMiddleware.checkCompanyUser, inboxController.getById)
router.patch('/company/:companyId/inbox', authMiddleware.checkAuthToken, companyMiddleware.checkCompanyUser, inboxController.bulkDelete)
router.patch('/company/:companyId/inbox/:inboxId',
  authMiddleware.checkAuthToken, companyMiddleware.checkCompanyUser,
  inboxMiddleware.checkInboxOwner, inboxController.update)
router.delete('/company/:companyId/inbox/:inboxId',
  authMiddleware.checkAuthToken, companyMiddleware.checkCompanyUser,
  inboxMiddleware.checkInboxOwner, inboxController.delete)
router.post('/company/:companyId/inbox/:inboxId', authMiddleware.checkAuthToken, companyMiddleware.checkCompanyUser, inboxMiddleware.checkInboxOwner, inboxController.postMessage)
router.delete('/company/:companyId/inbox/:inboxId/message/:messageId', authMiddleware.checkAuthToken, companyMiddleware.checkCompanyUser, inboxMiddleware.checkInboxOwner, inboxController.deleteMessage)

/***************************************************************************
 *  TEAM
 ***************************************************************************/

router.post('/company/:companyId/team', authMiddleware.checkAuthToken, companyMiddleware.checkCompanyUser, teamController.create)
router.get('/company/:companyId/team', authMiddleware.checkAuthToken, companyMiddleware.checkCompanyUser, teamController.get)
router.get('/company/:companyId/team/:teamId', authMiddleware.checkAuthToken, companyMiddleware.checkCompanyUser, teamMiddleware.checkOwner, teamController.getOne)
router.patch('/company/:companyId/team/:teamId', authMiddleware.checkAuthToken, companyMiddleware.checkCompanyUser, teamMiddleware.checkOwner, teamController.editV2)
router.delete('/company/:companyId/team/:teamId', authMiddleware.checkAuthToken, companyMiddleware.checkCompanyUser, teamMiddleware.checkOwner, teamController.delete)

/***************************************************************************
 *  FILE UPLOAD (PHOTO/VIDEO)
 ***************************************************************************/
router.post('/upload', authMiddleware.checkAuthToken, uploadController.presigned)

/***************************************************************************
 *  ROUTS FOR TESTING
 ***************************************************************************/
router.post('/spec/user', specMiddleware.checkSpec, specController.createUser)

module.exports = router
