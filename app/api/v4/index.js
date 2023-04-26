'use strict'

const express = require('express')
const authController = require('./../v4/auth/auth.controller')
const authMiddleware = require('./../v4/auth/auth.middleware')
const userController = require('./../v4/user/user.controller')
const userMiddleware = require('./../v4/user/user.middleware')
const companyController = require('./../v4/company/company.controller')
const systemController = require('./../v4/system/system.controller')
const companyMiddleware = require('./../v4/company/company.middleware')
const criteriaController = require('./../v4/criteria/criteria.controller')
const scenarioController = require('./../v4/scenario/scenario.controller')
const practiceController = require('./../v4/practice/practice.controller')
const reportController = require('./../v4/report/report.controller')
const templateController = require('./../v4/scenariotemplate/template.controller')
const reportMiddleware = require('./../v4/report/report.middleware')
const chatController = require('./../v4/chat/chat.controller')
const inboxController = require('./../v4/inbox/inbox.controller')
const teamController = require('./../v4/team/team.controller')
const practiceMiddleware = require('./../v4/practice/practice.middleware')
const scenarioMiddleware = require('./../v4/scenario/scenario.middleware')
const chatMiddleware = require('./../v4/chat/chat.middleware')
const teamMiddleware = require('./../v4/team/team.middleware')
const inboxMiddleware = require('./../v4/inbox/inbox.middleware')
const specMiddleware = require('./../v4/spec/spec.middleware')
const specController = require('./../v4/spec/spec.controller')
const uploadController = require('./../v4/upload/upload.controller')
const migrationController = require('./../v4/migration/migration.controller')
const tomController = require('./../v4/teachonmars/techonmars.controller')
const tomIntegrationsController = require('./../v4/tom-integrations/tom-integrations.controller')

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

router.param('chatId', (req, res, next, id) => {
  if (!ObjectId.isValid(id)) {
    return next(utils.ErrorHelper.badRequest('ERROR_INVALID_CHAT'))
  }
  next()
})

router.param('templateId', (req, res, next, id) => {
  if (!ObjectId.isValid(id)) {
    return next(utils.ErrorHelper.badRequest('ERROR_INVALID_TEMPLATE'))
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
router.post('/auth/change-password', authMiddleware.checkAuthToken, authController.changePass)
router.get('/auth/email-login', authController.logInEmail)
router.get('/auth/validate-reset-token', authController.validateResetToken)
router.get('/email-redirect', authController.redirectEmail)

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

router.post('/company/:companyId/import',
  authMiddleware.checkAuthToken,
  companyMiddleware.checkCompanyAdmin,
  companyController.import)

router.get('/company/:companyId/importStatus',
  authMiddleware.checkQueryToken,
  companyMiddleware.checkCompanyAdmin,
  companyController.importFileStatus)

/***************************************************************************
 *  TOM INTEGRATIONS
 ***************************************************************************/
router.get('/company/:companyId/integration',
  [
    authMiddleware.checkAuthToken,
    userMiddleware.checkSysAdmin,
    companyMiddleware.checkCompanyAdmin
  ],
  tomIntegrationsController.getCompanyIntegrationInfo
)

router.post('/company/:companyId/integration',
  [
    authMiddleware.checkAuthToken,
    userMiddleware.checkSysAdmin,
    companyMiddleware.checkCompanyAdmin
  ],
  tomIntegrationsController.addIntegrationToCompany
)

router.patch('/company/:companyId/integration',
  [
    authMiddleware.checkAuthToken,
    userMiddleware.checkSysAdmin,
    companyMiddleware.checkCompanyAdmin
  ],
  tomIntegrationsController.updateCompanyIntegration
)

router.delete('/company/:companyId/integration',
  [
    authMiddleware.checkAuthToken,
    userMiddleware.checkSysAdmin,
    companyMiddleware.checkCompanyAdmin
  ],
  tomIntegrationsController.deleteCompanyIntegration
)

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
  companyMiddleware.checkAdminOrManager,
  practiceController.export)

/***************************************************************************
 *  SCENARIO
 ***************************************************************************/

router.post('/company/:companyId/scenario', authMiddleware.checkAuthToken,
  companyMiddleware.checkCompanyUser, scenarioController.create)
router.post('/company/:companyId/scenario/:scenarioId/reminder', authMiddleware.checkAuthToken,
  scenarioMiddleware.checkCoach, scenarioController.sendReminder)
router.post('/company/:companyId/scenario/:scenarioId/examples', authMiddleware.checkAuthToken,
  companyMiddleware.checkCompanyUser, scenarioMiddleware.checkCoach, scenarioController.pushBestPractice)
router.patch('/company/:companyId/scenario/:scenarioId',
  authMiddleware.checkAuthToken, scenarioMiddleware.checkCoach,
  scenarioController.edit)
router.patch('/company/:companyId/scenario/:scenarioId/reminder',
  authMiddleware.checkAuthToken, scenarioMiddleware.checkCoach,
  scenarioController.editScenarioReminder)
router.get('/company/:companyId/scenario', authMiddleware.checkAuthToken,
  companyMiddleware.checkCompanyUser, scenarioController.get)
router.get('/company/:companyId/scenario/:scenarioId', authMiddleware.checkAuthToken,
  companyMiddleware.checkCompanyUser, scenarioController.getScenarioDetails)
router.delete('/company/:companyId/scenario/:scenarioId',
  authMiddleware.checkAuthToken, companyMiddleware.checkCompanyUser,
  scenarioMiddleware.checkCoach, scenarioController.delete)

router.get('/company/:companyId/test-admin-scenario',
  authMiddleware.checkAuthToken,
  companyMiddleware.checkAdminOrManager,
  scenarioController.countAdminScenario)

router.get('/company/:companyId/admin-scenario',
  authMiddleware.checkAuthToken,
  companyMiddleware.checkAdminOrManager,
  scenarioController.getAdminScenario)

router.get('/company/:companyId/admin-scenario/:scenarioId',
  authMiddleware.checkAuthToken,
  companyMiddleware.checkAdminOrManager,
  scenarioController.getAdminScenarioDetails)

router.get('/company/:companyId/admin-scenario/:scenarioId/learners-videos',
  authMiddleware.checkAuthToken,
  companyMiddleware.checkCompanyAdmin,
  scenarioController.getAdminScenarioLearnersVideos
)

router.get('/company/:companyId/admin-scenario/:scenarioId/practice',
  authMiddleware.checkAuthToken,
  companyMiddleware.checkAdminOrManager,
  scenarioController.getAdminScenarioPractices)

router.get('/company/:companyId/admin-scenario/:scenarioId/practice/:practiceId',
  authMiddleware.checkAuthToken,
  companyMiddleware.checkAdminOrManager,
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
 *  CHAT
 ***************************************************************************/

router.get('/company/:companyId/chat',
  authMiddleware.checkAuthToken, companyMiddleware.checkCompanyUser,
  chatController.getAll)
router.get('/company/:companyId/chat/:chatId',
  authMiddleware.checkAuthToken, companyMiddleware.checkCompanyUser,
  chatMiddleware.checkChatMember, chatController.getById)
router.post('/company/:companyId/chat',
  authMiddleware.checkAuthToken, companyMiddleware.checkCompanyUser,
  chatController.create)
router.post('/company/:companyId/chat/:chatId',
  authMiddleware.checkAuthToken, companyMiddleware.checkCompanyUser,
  chatMiddleware.checkChatMember, chatController.postMessage)
router.delete('/company/:companyId/chat/:chatId/message/:messageId',
  authMiddleware.checkAuthToken, companyMiddleware.checkCompanyUser,
  chatMiddleware.checkChatMember, chatController.deleteMessage)
router.patch('/company/:companyId/chat/:chatId/user',
  authMiddleware.checkAuthToken, companyMiddleware.checkCompanyUser,
  chatMiddleware.checkChatModerator, chatController.manageUsers)
router.patch('/company/:companyId/chat/:chatId',
  authMiddleware.checkAuthToken, companyMiddleware.checkCompanyUser,
  chatMiddleware.checkChatMember, chatController.edit)
router.delete('/company/:companyId/chat/:chatId',
  authMiddleware.checkAuthToken, companyMiddleware.checkCompanyUser,
  chatMiddleware.checkChatModerator, chatController.delete)

/***************************************************************************
 *  TEAM
 ***************************************************************************/

router.post('/company/:companyId/team', authMiddleware.checkAuthToken, companyMiddleware.checkCompanyUser, teamController.create)
router.get('/company/:companyId/team', authMiddleware.checkAuthToken, companyMiddleware.checkCompanyUser, teamController.get)
router.get('/company/:companyId/team/:teamId', authMiddleware.checkAuthToken, companyMiddleware.checkCompanyUser, teamMiddleware.checkOwner, teamController.getOne)
router.patch('/company/:companyId/team/:teamId', authMiddleware.checkAuthToken, companyMiddleware.checkCompanyUser, teamMiddleware.checkOwner, teamController.editV2)
router.delete('/company/:companyId/team/:teamId', authMiddleware.checkAuthToken, companyMiddleware.checkCompanyUser, teamMiddleware.checkOwner, teamController.delete)

/***************************************************************************
 *  FILE UPLOAD (PHOTO/VIDEO/FILE)
 ***************************************************************************/
router.post('/upload', authMiddleware.checkAuthToken, uploadController.presigned)

/***************************************************************************
 *  ROUTS FOR TESTING
 ***************************************************************************/
router.post('/spec/user', specMiddleware.checkSpec, specController.createUser)

/***************************************************************************
 *  MIGRATION ROUTES
 ***************************************************************************/
router.post('/scenario-chats', migrationController.addChats)
router.post('/delete-chats', migrationController.deleteChats)
router.post('/resolve-teams', migrationController.addTeamProperty)

/***************************************************************************
 *  REPORTS
 ***************************************************************************/
router.get('/company/:companyId/report-learner',
  authMiddleware.checkAuthToken, companyMiddleware.checkCompanyUser,
  reportController.learnerReport)
router.get('/company/:companyId/scenario-learner/:scenarioId',
  authMiddleware.checkAuthToken, companyMiddleware.checkCompanyUser,
  reportController.scenarioDetails)
router.get('/company/:companyId/coach',
  authMiddleware.checkAuthToken, companyMiddleware.checkCompanyUser,
  reportController.coachesInCompany)
router.get('/company/:companyId/report-coach',
  authMiddleware.checkAuthToken, companyMiddleware.checkCompanyUser,
  reportController.coachReport)
router.get('/company/:companyId/report-coach/user-score',
  authMiddleware.checkAuthToken, companyMiddleware.checkCompanyUser,
  reportController.teamMembersScore)
router.get('/company/:companyId/report-coach/user-responsiveness',
  authMiddleware.checkAuthToken, companyMiddleware.checkCompanyUser,
  reportController.teamMembersResponsiveness)
router.get('/company/:companyId/report-coach/user-score/:userId',
  authMiddleware.checkAuthToken, companyMiddleware.checkCompanyUser,
  reportMiddleware.checkScenarioCoach, reportController.scoreByScenario)
router.get('/company/:companyId/report-coach/user-responsiveness/:userId',
  authMiddleware.checkAuthToken, companyMiddleware.checkCompanyUser,
  reportMiddleware.checkScenarioCoach, reportController.responsivenessByScenario)
router.get('/company/:companyId/report-coach/user-score/:userId/scenario/:scenarioId',
  authMiddleware.checkAuthToken, companyMiddleware.checkCompanyUser,
  reportMiddleware.checkScenarioCoach, reportController.learnerScenarioDetails)
router.get('/company/:companyId/report-admin',
  authMiddleware.checkAuthToken, companyMiddleware.checkAdminOrManager,
  reportController.companyDashboard)
router.get('/company/:companyId/report-admin/chart',
  authMiddleware.checkAuthToken, companyMiddleware.checkAdminOrManager,
  reportController.adminCharts)

/***************************************************************************
*  Teach On Mars
***************************************************************************/

router.get('/tom', tomController.autoSignIn)

/***************************************************************************
*  Scenario Template
***************************************************************************/

router.post('/company/:companyId/template',
  authMiddleware.checkAuthToken,
  companyMiddleware.checkAdminOrManager,
  templateController.create)
router.post('/company/:companyId/template/:templateId/assign',
  authMiddleware.checkAuthToken,
  companyMiddleware.checkAdminOrManager,
  templateController.assignCoaches)
router.patch('/company/:companyId/template/:templateId',
  authMiddleware.checkAuthToken,
  companyMiddleware.checkAdminOrManager,
  templateController.edit)
router.patch('/company/:companyId/template',
  authMiddleware.checkAuthToken,
  companyMiddleware.checkAdminOrManager,
  templateController.delete)
router.get('/company/:companyId/template',
  authMiddleware.checkAuthToken,
  companyMiddleware.checkAdminOrManager,
  templateController.get)
router.get('/company/:companyId/template/:templateId',
  authMiddleware.checkAuthToken,
  companyMiddleware.checkAdminOrManager,
  templateController.getOne)

module.exports = router
