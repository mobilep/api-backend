'use strict'

const helperUser = require('../user/user.helper')
const daoUser = require('../user/user.dao')
const crypto = require('crypto')

const intercomEmitter = require('../intercom/IntercomEmitter')

const admin = require('firebase-admin')

// const getTokensByUserId = (id) => {
//   daoUser.getById(id).then((user) => {
//     console.log(user)
//     const authToken = utils.Passport.createAuthToken(user)
//     console.log('Authorization: ', authToken)
//     return admin.auth().createCustomToken(user._id.toString())
//   }).then((val) => {
//     console.log('FirebaseToken', val)
//   })
// }

// getTokensByUserId('5ac33a66b6c2a8602917029e')

module.exports.signin = async (req, res, next) => {
  const result = helperUser.validateSignin(req.body)

  return daoUser.getByEmail(result.email).then(async (user) => {
    if (!user) throw utils.ErrorHelper.badRequest('ERROR_INVALID_USER')
    if (!result.password) {
      if (!user._company) {
        throw utils.ErrorHelper.forbidden('ERROR_ACCESS_DENIED')
      }
      // send Magic link
      const authToken = utils.Passport.createAuthToken(user)
      const magicToken = crypto.createHash('sha256')
        .update(authToken)
        .digest('hex')
      utils.Mail.sendMagicSigninLink(user.email, user.firstName, magicToken, user.lang)
      user.magicToken = magicToken
      return user.save().then((result) => {
        return res.json({status: 'OK'})
      })
    }

    if (user.password !== utils.Passport.encryptPassword(result.password)) throw utils.ErrorHelper.badRequest('ERROR_AUTH')
    if (!(user.isSysAdmin || user.isCompanyAdmin || user.managerCriteria) && req.body.webForm === true) {
      throw utils.ErrorHelper.forbidden('ERROR_ACCESS_DENIED')
    }

    if (!user._company) {
      if (req.body.webForm !== true) {
        throw utils.ErrorHelper.forbidden('ERROR_ACCESS_DENIED')
      }
    }
    if (!user.firstLogIn) {
      user.firstLogIn = new Date()
      await user.save()
    }
    user = user.toJSON()
    user.accessToken = utils.Passport.createAuthToken(user)
    user.fbtoken = await admin.auth().createCustomToken(user._id.toString())
    intercomEmitter.emit('user-sign-in', {email: user.email})
    res.json(user)
  }).catch((err) => {
    console.log('err', err)
    return next(err)
  })
}

module.exports.signinMagic = async (req, res) => {
  try {
    const magicToken = req.query.token
    const user = await daoUser.getOne({magicToken: magicToken, isSysAdmin: false, isActive: true})
    if (!user) throw utils.ErrorHelper.badRequest('ERROR_TOKEN_IS_EXPIRED')
    user.magicToken = null
    if (!user.firstLogIn) {
      user.firstLogIn = new Date()
    }
    await user.save()
    const accessToken = utils.Passport.createAuthToken(user)
    const fbtoken = await admin.auth().createCustomToken(user._id.toString())
    intercomEmitter.emit('user-sign-in', {email: user.email})
    res.redirect('mobilepractice://signin?token=' + accessToken + '&fbtoken=' + fbtoken)
  } catch (e) {
    const lang = req.query.lang || 'en'
    res.redirect('mobilepractice://error?code=' + e.error + '&message=' + i18n.__({phrase: e.message, locale: lang}))
  }
}

module.exports.requestForgotPass = (req, res, next) => {
  const result = helperUser.validateForgotPass(req.body)

  return daoUser.getOne(
    {email: result.email, $or: [{isCompanyAdmin: true}, {isSysAdmin: true}, {managerCriteria: {$exists: true, $ne: ''}}]})
    .then((user) => {
      if (!user) throw utils.ErrorHelper.badRequest('ERROR_INVALID_USER')
      user.resetToken = utils.Passport.createResetToken(user, 24 * 60 * 60 * 7)
      return user.save()
    })
    .then((user) => {
      utils.Mail.forgotPassEmail(user.email, user.resetToken, user.lang)
      res.json({status: 'OK'})
    })
    .catch((err) => {
      console.log('err', err)
      return next(err)
    })
}

module.exports.requestClientForgotPass = (req, res, next) => {
  const result = helperUser.validateClientForgotPass(req.body)
  let client = null
  if (result.resetClient) {
    client = result.resetClient
  }
  return daoUser.getOne({email: result.email})
    .then((user) => {
      if (!user) throw utils.ErrorHelper.badRequest('ERROR_INVALID_USER')
      user.resetToken = utils.Passport.createResetToken(user, 24 * 60 * 60 * 7)
      return user.save()
    })
    .then((user) => {
      utils.Mail.forgotClientPassEmail(user.email, user.resetToken, user.lang, client)
      res.json({status: 'OK'})
    })
    .catch((err) => {
      console.log('err', err)
      return next(err)
    })
}

module.exports.newPass = (req, res, next) => {
  const result = helperUser.validateNewPass(req.body)

  if (req.user.password === utils.Passport.encryptPassword(result.password)) {
    throw utils.ErrorHelper.badRequest('ERROR_MATCH_PASSWORDS')
  }
  req.user.password = result.password
  req.user.resetToken = null

  return req.user.save().then((user) => {
    return res.json(user)
  }).catch((err) => {
    console.log('err', err)
    return next(err)
  })
}

module.exports.createNewPass = async (req, res, next) => {
  try {
    const result = helperUser.validateNewPass(req.body)
    if (req.user.password === utils.Passport.encryptPassword(result.password)) {
      throw utils.ErrorHelper.badRequest('ERROR_MATCH_PASSWORDS')
    }
    req.user.password = result.password
    req.user.resetToken = null
    if (result.terms && result.terms === true) {
      req.user.terms = true
    }
    let user = await req.user.save()
    // return res.json(user)
    if (!user.firstLogIn) {
      user.firstLogIn = new Date()
      await user.save()
    }
    user = user.toJSON()
    user.accessToken = utils.Passport.createAuthToken(user)
    user.fbtoken = await admin.auth().createCustomToken(user._id.toString())
    intercomEmitter.emit('user-sign-in', {email: user.email})
    res.json(user)
  } catch (err) {
    console.log('err', err)
    return next(err)
  }
}

module.exports.changePass = (req, res, next) => {
  const result = helperUser.validateChangePass(req.body)

  const user = req.user

  if (user.password !== utils.Passport.encryptPassword(result.oldPassword)) {
    throw utils.ErrorHelper.badRequest('ERROR_INVALID_PASSWORD')
  }

  if (user.password === utils.Passport.encryptPassword(result.newPassword)) {
    throw utils.ErrorHelper.badRequest('ERROR_MATCH_PASSWORDS')
  }

  user.password = result.newPassword
  return req.user.save().then((user) => {
    return res.json(user)
  }).catch((err) => {
    console.log('err', err)
    return next(err)
  })
}
