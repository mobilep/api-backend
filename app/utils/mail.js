'use strict'

const path = require('path')
const moment = require('moment')
const _config = require('../config/config.js')

const EmailTemplate = require('email-templates').EmailTemplate
const templatesDir = path.resolve(__dirname, '../', 'config/templates')

const ses = require('node-ses')

const client = ses.createClient({
  key: _config.aws.accessKeyId,
  secret: _config.aws.secretAccessKey,
  amazon: 'https://email.' + _config.aws.region + '.amazonaws.com'
})

function _sendMessage (opts) {
  return new Promise((resolve, reject) => {
    // disable mail service on testing environment
    if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'testci') {
      return resolve()
    }

    opts = opts || {}

    const to = opts.to.map((item) => {
      return item.email
    })

    client.sendEmail({
      to: to,
      from: '"' + opts.fromName + '" ' + '<' + opts.fromEmail + '>',
      subject: opts.subject,
      message: opts.html,
      altText: opts.text
    }, function (err, data, res) {
      if (err) {
        console.log('A ses error occurred: ', err, data)
        return reject(err)
      }

      return resolve(res)
    })
  })
}

module.exports.sendMagicSigninLink = function (
  userEmail, userFirstName, accessToken, lang) {
  const inviteEmail = new EmailTemplate(
    path.join(templatesDir, 'signinLink/' + lang))

  const link = _config.api + '/auth/magic?lang=' + lang + '&token=' + accessToken

  return inviteEmail.render({link: link, userFirstName: userFirstName, web: _config.web})
    .then((result) => {
      return _sendMessage({
        subject: i18n.__({phrase: utils.Const.ses.signinLink.subject, locale: lang}),
        fromName: utils.Const.ses.signinLink.fromName,
        fromEmail: utils.Const.ses.fromEmail,
        to: [
          {
            email: userEmail,
            type: 'to'
          }],
        html: result.html,
        text: result.text
      })
    })
}

module.exports.sendInviteEmail = function (token, userEmail, userFirstName, company, lang) {
  const inviteEmail = new EmailTemplate(path.join(templatesDir, 'invite/' + lang))
  const uri = _config.webClient
  let link = uri
  if (token) {
    link = uri + '/create-password/' + token + '/' + userEmail
  }

  const params = {
    link: getEmailRedirectLink(userEmail, link + `?runMobilePracticeProtocol=true&lang=${lang}`),
    userFirstName: userFirstName,
    company: company,
    // appStore: utils.Const.appStore,
    web: _config.web + `?runMobilePracticeProtocol=true&lang=${lang}`
  }
  return inviteEmail.render(params).then((result) => {
    return _sendMessage({
      subject: i18n.__({phrase: utils.Const.ses.invite.subject, locale: lang}),
      fromName: utils.Const.ses.invite.fromName,
      fromEmail: utils.Const.ses.fromEmail,
      to: [
        {
          email: userEmail,
          type: 'to'
        }],
      html: result.html,
      text: result.text
    })
  }).catch(() => {
    throw utils.ErrorHelper.serverError('ERROR_SEND_EMAIL')
  })
}

module.exports.sendAssignEmail = (practice) => {
  const lang = practice._user.lang
  const email = practice._user.email
  const assignEmail = new EmailTemplate(path.join(templatesDir, 'assign/' + lang))
  const params = {
    web: _config.web + '?runMobilePracticeProtocol=true'
  }

  return assignEmail.render(params).then((result) => {
    return _sendMessage({
      subject: i18n.__({phrase: utils.Const.ses.assign.subject, locale: lang}),
      fromName: utils.Const.ses.assign.fromName,
      fromEmail: utils.Const.ses.fromEmail,
      to: [
        {
          email: email,
          type: 'to'
        }],
      html: result.html,
      text: result.text
    })
  }).catch(() => {
    throw utils.ErrorHelper.serverError('ERROR_SEND_EMAIL')
  })
}

module.exports.forgotPassEmail = function (userEmail, token, lang) {
  const forgotPass = new EmailTemplate(
    path.join(templatesDir, 'forgotPass/' + lang))
  const uri = _config.web
  const link = uri + '/#/auth?jwt=' + token + '&runMobilePracticeProtocol=true'

  return forgotPass.render({link: link, web: _config.web + '?runMobilePracticeProtocol=true'}).then((result) => {
    return _sendMessage({
      subject: i18n.__({phrase: utils.Const.ses.forgotPass.subject, locale: lang}),
      fromName: utils.Const.ses.forgotPass.fromName,
      fromEmail: utils.Const.ses.fromEmail,
      to: [
        {
          email: userEmail,
          type: 'to'
        }],
      html: result.html,
      text: result.text
    })
  }).catch((err) => {
    console.log(err)
    throw utils.ErrorHelper.serverError('ERROR_SEND_EMAIL')
  })
}

module.exports.forgotClientPassEmail = function (userEmail, token, lang, tempServer) {
  const forgotPass = new EmailTemplate(path.join(templatesDir, 'forgotPass/' + lang))
  const uri = _config.webClient
  let link = uri + '/' + token + '/' + userEmail
  if (tempServer) {
    link = tempServer + '/' + token + '/' + userEmail
  }
  return forgotPass.render({
    link: getEmailRedirectLink(userEmail, link + '?runMobilePracticeProtocol=true&lang=' + lang),
    web: _config.webClient + '?runMobilePracticeProtocol=true'
  }).then((result) => {
    return _sendMessage({
      subject: i18n.__({phrase: utils.Const.ses.forgotPass.subject, locale: lang}),
      fromName: utils.Const.ses.forgotPass.fromName,
      fromEmail: utils.Const.ses.fromEmail,
      to: [
        {
          email: userEmail,
          type: 'to'
        }],
      html: result.html,
      text: result.text
    })
  }).catch((err) => {
    console.log(err)
    throw utils.ErrorHelper.serverError('ERROR_SEND_EMAIL')
  })
}

module.exports.createPassEmail = function (userEmail, token, lang) {
  const forgotPass = new EmailTemplate(path.join(templatesDir, 'welcome/' + lang))
  const uri = _config.webClient

  let link = uri + '/create-password/' + token + '/' + userEmail

  return forgotPass.render({
    link: link + '?runMobilePracticeProtocol=true',
    appStore: utils.Const.appStore,
    web: uri + '?runMobilePracticeProtocol=true'
  }).then((result) => {
    return _sendMessage({
      // subject: i18n.__({phrase: utils.Const.ses.forgotPass.subject, locale: lang}),
      subject: i18n.__({phrase: utils.Const.ses.invite.subject, locale: lang}),
      fromName: utils.Const.ses.forgotPass.fromName,
      fromEmail: utils.Const.ses.fromEmail,
      to: [
        {
          email: userEmail,
          type: 'to'
        }
      ],
      html: result.html,
      text: result.text
    })
  }).catch((err) => {
    console.log(err)
    throw utils.ErrorHelper.serverError('ERROR_SEND_EMAIL')
  })
}

const getDate = () => {
  return moment().format('dddd MMM[.]Do - H[h]mm')
}

const getInitials = (firstName, lastName) => {
  const first = firstName ? firstName[0].toUpperCase() : ''
  const last = lastName ? lastName[0].toUpperCase() : ''
  return `${first}${last}`
}

const getAvatar = (user) => {
  const initials = getInitials(user.firstName, user.lastName)
  if (user.avatar_sm) {
    return `
        <td style="width: 32px">
      <table border="0" cellpadding="0" cellspacing="0"><tr>
      <td align='center' valign='center' width='32'
      height='32' style='
      width:32px;
      max-width: 100%;
      max-height: 100%;
      height:32px;
      -webkit-border-radius: 50%;
      -moz-border-radius: 50%;
      border-radius: 50%;
      width:32px;
      height:32px;
      color:#fff;
      background-image: url("${user.avatar_sm}");
      background-size: cover;
      background-position: top center;
      '>
        <!--[if mso]>
          <v:oval style='width:32px;height:32px;' stroke="f" fill="true">
            <v:image xmlns:v="urn:schemas-microsoft-com:vml" style="width:525pt; height:348.75pt;" src="${user.avatar_sm}" /> 
            <v:fill type="frame" src="${user.avatar_sm}" style="z-index: 1;" color="#${user.avatarColor}"/>
            <v:textbox inset="0,0,0,0">
            <center style="color: #fff;">
              ${initials}
            </center>
            </v:textbox>
          </v:oval>
        <![endif]-->
      </td>
      </tr>
      </table>
        </td>
    `
  }
  return `
    <td style="width: 32px">
      <table border="0" cellpadding="0" cellspacing="0">
      <tr>
        <td align='center' valign='center' style='border-radius: 50%;color:#fff' width='32' height='32' bgcolor='#${user.avatarColor}'>${initials}</td>
       </tr>
       </table>
    </td>
  `
}

const getHead = () => {
  return `<!--[if gte mso 9]><xml>
  <o:OfficeDocumentSettings>
   <o:AllowPNG/>
   <o:PixelsPerInch>96</o:PixelsPerInch>
  </o:OfficeDocumentSettings>
 </xml><![endif]-->`
}

const getBtn = ({btn, url}) => {
  if (btn) {
    return `
      <div><!--[if mso]>
      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${url}" style="height:40px;v-text-anchor:middle;width:350px;" arcsize="13%" stroke="f" fillcolor="#f3423c">
        <w:anchorlock/>
        <center>
      <![endif]-->
          <a href="${url}"
    style="background-color:#f3423c;border-radius:5px;color:#ffffff;display:inline-block;font-family:sans-serif;font-size:13px;font-weight:bold;line-height:40px;text-align:center;text-decoration:none;width:350px;-webkit-text-size-adjust:none;">${btn}</a>
      <!--[if mso]>
        </center>
      </v:roundrect>
    <![endif]--></div>
    `
  }
  return ''
}

const getEmailLinkWithToken = (email, link) => {
  const accessToken = utils.Passport.createEmailToken(email, link)
  return _config.currentApi + '/auth/email-login?token=' + accessToken
}

const getEmailRedirectLink = (email, link) => {
  const accessToken = utils.Passport.createEmailToken(email, link)
  return _config.currentApi + '/email-redirect?token=' + accessToken
}

const getData = (to, from, prop) => {
  const emailTitle = prop.type === 'CHAT_MESSAGE' || 'SYSTEM_MESSAGE' ? 'EMAIL_TITLE_CHAT' : 'EMAIL_TITLE'

  const data = {
    web: _config.webClient,
    url: _config.webClient,
    userFirstName: to.firstName,
    tpl: 'message',
    subject: i18n.__({phrase: utils.Const.ses.notifyEmail.subject, locale: to.lang}),
    btn: i18n.__({phrase: 'EMAIL_BUTTON', locale: to.lang}),
    titleText: i18n.__({phrase: emailTitle, locale: to.lang}),
    contentTitle: i18n.__({phrase: 'EMAIL_CONTENT_TITLE', locale: to.lang}, {from: from.name, date: getDate()}),
    message: prop.message,
    avatar: getAvatar(from),
    description: '',
    botton: ``,
    head: getHead()
  }

  switch (prop.type) {
    case 'PRACTICE_EVALUATED':
      data.btn = i18n.__({phrase: 'EMAIL_BUTTON_EVALUATION', locale: to.lang})
      data.url = getEmailLinkWithToken(to.email, `/scenarios/practice-chat/${prop.inboxId}?fromEmail=true`)
      data.avatar = ''
      data.subject = i18n.__({phrase: 'EMAIL_SUBJECT_EVALUATED', locale: to.lang}, from.name)
      data.titleText = i18n.__({phrase: 'EMAIL_TITLE_EVALUATED', locale: to.lang})
      data.contentTitle = i18n.__({phrase: 'EMAIL_CONTENT_EVALUATED', locale: to.lang}, {from: from.name, date: getDate()})
      data.message = ''
      break
    case 'BEST_PRACTICE_SAVED':
    case 'INBOX_MESSAGE':
    {
      const url = prop.inboxType === 'inbox' ? `/inbox/chat/${prop.inboxId}?fromEmail=true`
        : `/scenarios/practice-chat/${prop.inboxId}?fromEmail=true`
      data.url = getEmailLinkWithToken(to.email, url)
      data.subject = i18n.__({phrase: 'EMAIL_SUBJECT_MESSAGE', locale: to.lang}, from.name)
      if (prop.message === 'Video') {
        data.subject = i18n.__({phrase: 'EMAIL_SUBJECT_VIDEO', locale: to.lang}, from.name)
        data.btn = i18n.__({phrase: 'EMAIL_BUTTON_VIDEO', locale: to.lang})
        data.titleText = i18n.__({phrase: 'EMAIL_TITLE_VIDEO', locale: to.lang})
        data.contentTitle = i18n.__({phrase: 'EMAIL_CONTENT_TITLE_VIDEO', locale: to.lang}, {from: from.name, date: getDate()})
        data.message = ''
      }
      break
    }
    case 'CHAT_MESSAGE':
      const url = prop.chatType === 'inbox' ? `/inbox/group-chat/${prop.inboxId}?fromEmail=true`
        : `/scenarios/group-chat/${prop.inboxId}?fromEmail=true`
      data.url = getEmailLinkWithToken(to.email, url)
      data.subject = i18n.__({phrase: 'EMAIL_SUBJECT_MESSAGE_CHAT', locale: to.lang}, from.name)
      if (prop.message === 'Video') {
        data.subject = i18n.__({phrase: 'EMAIL_SUBJECT_VIDEO', locale: to.lang}, from.name)
        data.btn = i18n.__({phrase: 'EMAIL_BUTTON_VIDEO', locale: to.lang})
        data.titleText = i18n.__({phrase: 'EMAIL_TITLE_VIDEO', locale: to.lang})
        data.contentTitle = i18n.__({phrase: 'EMAIL_CONTENT_TITLE_VIDEO', locale: to.lang}, {from: from.name, date: getDate()})
        data.message = ''
      }
      break
    case 'SYSTEM_MESSAGE':
      data.url = getEmailLinkWithToken(to.email, `/scenarios/group-chat/${prop.inboxId}?fromEmail=true`)
      data.subject = i18n.__({phrase: 'EMAIL_SUBJECT_MESSAGE_CHAT', locale: to.lang}, 'Mobile Practice')
      data.contentTitle = i18n.__({phrase: 'EMAIL_CONTENT_TITLE', locale: to.lang}, {from: 'Mobile Practice', date: getDate()})
      data.avatar = ''
      break
    case 'PRACTICE_ASSIGNED':
      data.url = getEmailLinkWithToken(to.email, `/scenarios/${prop.inboxId}?fromEmail=true`)
      data.subject = i18n.__({phrase: 'EMAIL_SUBJECT_PRACTICE', locale: to.lang}, from.name)
      data.btn = i18n.__({phrase: 'EMAIL_BUTTON_PRACTICE', locale: to.lang})
      data.titleText = i18n.__({phrase: 'EMAIL_TITLE_PRACTICE', locale: to.lang})
      data.contentTitle = i18n.__({phrase: 'EMAIL_CONTENT_TITLE_PRACTICE', locale: to.lang}, {from: from.name, date: getDate(), name: prop.name})
      data.message = prop.name
      break
    case 'SCENARIO_ASSIGNED':
      data.url = getEmailLinkWithToken(to.email, `/scenarios/${prop.inboxId}?fromEmail=true`)
      data.subject = i18n.__({phrase: 'EMAIL_ASSIGN_SCENARIO_SUBJECT', locale: to.lang}, 'Mobile Practice')
      data.btn = i18n.__({phrase: 'EMAIL_BUTTON_PRACTICE', locale: to.lang})
      data.titleText = i18n.__({phrase: 'EMAIL_TITLE_SCENARIO', locale: to.lang}, prop.name)
      data.contentTitle = i18n.__({phrase: 'EMAIL_CONTENT_TITLE_PRACTICE', locale: to.lang}, {from: 'Mobile Practice', date: getDate()})
      data.message = prop.message
      data.avatar = ''
      break
  }

  data.web = data.web + '?runMobilePracticeProtocol=true'
  data.url = data.url + '&runMobilePracticeProtocol=true'

  data.botton = getBtn(data)
  data.prop = JSON.stringify(prop)
  return data
}

module.exports.notificationEmail = async function (to, from, prop) {
  console.log('*** notificationEmail ***')
  const data = getData(to, from, prop)
  const {tpl, subject} = data

  const notifyEmail = new EmailTemplate(path.join(templatesDir, `notificationEmail/${tpl}/${to.lang}`))
  const template = await notifyEmail.render(data)
  try {
    _sendMessage({
      subject: subject,
      fromName: utils.Const.ses.notifyEmail.fromName,
      fromEmail: utils.Const.ses.fromEmail,
      to: [
        {
          email: to.email,
          type: 'to'
        }
      ],
      html: template.html
    })
  } catch (error) {
    console.log('->', error)
    throw utils.ErrorHelper.serverError('ERROR_SEND_EMAIL')
  }
}
