'use strict'
const AWS = require('aws-sdk')
const _config = require('../config/config.js')
AWS.config.update({
  accessKeyId: _config.aws.accessKeyId,
  secretAccessKey: _config.aws.secretAccessKey,
  region: _config.aws.region
})

const sns = new AWS.SNS()

module.exports.createPlatformEndpoint = async (token, isAndroid = false) => {
  try {
    const PlatformApplicationArn = isAndroid ? _config.aws.ANDROID_APPLICATION_ARN : _config.aws.APPLICATION_ARN

    const data = await sns.createPlatformEndpoint({
      PlatformApplicationArn,
      Token: token,
      Attributes: {
        'Enabled': 'true'
      }
    }).promise()

    return data && data.EndpointArn
  } catch (err) {
    console.log(err)
  }
}

module.exports.deleteEndpoint = (endpointArn) => {
  return new Promise((resolve, reject) => {
    sns.deleteEndpoint({
      EndpointArn: endpointArn
    }, (err, data) => {
      if (!err) {
        resolve(data)
      } else {
        reject(err)
      }
    })
  })
}

module.exports.sendPushNotification = (device, prop) => {
  const token = device.token || ''
  const endpointArn = device.endpointArn
  const isAndroid = device.isAndroid

  // TODO add setAttributes to sns
  sns.setEndpointAttributes({
    Attributes: {
      'Enabled': 'true'
    },
    EndpointArn: endpointArn
  }, (err, data) => {
    if (err) {
      console.log(err, err.stack)
      return
    }
    const payload = formBody(prop, token, isAndroid)

    sns.publish({
      Message: payload,
      MessageStructure: 'json',
      TargetArn: endpointArn
    }, function (err, data) {
      if (err) {
        console.log(token)
        console.log(err.stack)
        return
      }
      console.log('push sent')
      console.log(data)
    })
  })
}

function formBody (prop, token, isAndroid = false) {
  const type = prop.type || 'UNDEFINED'
  const message = prop.message || 'NO_MESSAGE'
  const name = prop.name || 'NO_NAME'
  const inboxId = prop.inboxId || null

  let payload

  if (isAndroid) {
    const obj = {
      notification: {
        title: name,
        body: message
      },
      message: {
        token
      }
    }

    // if (inboxId) {
    //   obj.notification.inboxId = inboxId
    // }
    // if (prop.badge) {
    //   obj.notification.badge = prop.badge
    // }

    payload = {GCM: JSON.stringify(obj)}
  } else {
    let locArgs = [name, message]
    if (inboxId) {
      locArgs = [name, message, inboxId]
    }
    const obj = {
      aps: {
        alert: {
          'loc-args': locArgs,
          'loc-key': type
        },
        sound: 'default'
      }
    }
    if (prop.badge) {
      obj.aps.badge = prop.badge
    }

    if (prop.welcome) {
      obj.aps.alert['title-loc-key'] = 'PRACTICE_ASSIGNED_TITLE'
    }

    payload = {
      // default: message,
      APNS_SANDBOX: JSON.stringify(obj),
      APNS: JSON.stringify(obj)
    }
  }
  return JSON.stringify(payload)
}

module.exports.userUpdatePN = (device) => {
  const token = device.token
  sns.createPlatformEndpoint({
    PlatformApplicationArn: _config.aws.APPLICATION_ARN,
    Token: token,
    Attributes: {
      'Enabled': 'true'
    }
  }, function (err, data) {
    if (err) {
      // TODO add setAttributes to sns
      console.log(data)
      console.log(token)
      console.log(err)
      return
    }

    const endpointArn = data.EndpointArn
    const obj = {
      aps: {
        'content-available': 1
      },
      'event-category': 'USER_UPDATE'
    }

    let payload = {
      APNS_SANDBOX: JSON.stringify(obj),
      APNS: JSON.stringify(obj)
    }
    payload = JSON.stringify(payload)

    console.log('sending push')
    sns.publish({
      Message: payload,
      MessageStructure: 'json',
      TargetArn: endpointArn
    }, function (err, data) {
      if (err) {
        console.log(token)
        console.log(err.stack)
        return
      }
      console.log('push sent')
      console.log(data)
    })
  })
}
