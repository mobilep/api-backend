'use strict'

const AWS = require('aws-sdk')

const _config = require('./../../../config/config.js')
const consts = require('./tom-integration.consts')
const secretsManager = new AWS.SecretsManager({
  region: _config.aws.region,
  accessKeyId: _config.aws.accessKeyId,
  secretAccessKey: _config.aws.secretAccessKey
})

const AWS_DECRYPTION_FAILURE_EXCEPTION = 'DecryptionFailureException'
const AWS_INTERNAL_SERVICE_ERROR_EXCEPTION = 'InternalServiceErrorException'
const AWS_INVALID_PARAMETER_EXCEPTION = 'InvalidParameterException'
const AWS_INVALID_REQUEST_EXCEPTION = 'InvalidRequestException'
const AWS_RESOURCE_NOT_FOUND_EXCEPTION = 'ResourceNotFoundException'

/**
 * Get data from the SM
 *
 * @param {String} secretName
 *
 * @return {Promise<Object>}
 * @private
 */
async function _getSecret (secretName) {
  return new Promise((resolve, reject) => {
    secretsManager.getSecretValue({ SecretId: secretName }, (err, data) => {
      if (err) {
        switch (err.code) {
          case AWS_DECRYPTION_FAILURE_EXCEPTION:
            // Secrets Manager can't decrypt the protected secret text using the provided KMS key.
            // Deal with the exception here, and/or rethrow at your discretion.
            break
          case AWS_INTERNAL_SERVICE_ERROR_EXCEPTION:
            // An error occurred on the server side.
            // Deal with the exception here, and/or rethrow at your discretion.
            break
          case AWS_INVALID_PARAMETER_EXCEPTION:
            // You provided an invalid value for a parameter.
            // Deal with the exception here, and/or rethrow at your discretion.
            break
          case AWS_INVALID_REQUEST_EXCEPTION:
            // You provided a parameter value that is not valid for the current state of the resource.
            // Deal with the exception here, and/or rethrow at your discretion.
            break
          case AWS_RESOURCE_NOT_FOUND_EXCEPTION:
            // We can't find the resource that you asked for.
            // Deal with the exception here, and/or rethrow at your discretion.
            return resolve(null)
        }

        return reject(err)
      }

      // Decrypts secret using the associated KMS CMK.
      // Depending on whether the secret is a string or binary, one of these fields will be populated.
      // if ('SecretString' in data) {
      //   const secret = data.SecretString
      // } else {
      //   let buff = Buffer.from(data.SecretBinary, 'base64')
      //   const decodedBinarySecret = buff.toString('ascii')
      // }

      return resolve(JSON.parse(data.SecretString))
    })
  })
}

/**
 * Store data into the SM
 *
 * @param {String} secretName
 * @param {Object} data
 *
 * @return {Promise<unknown>}
 * @private
 */
async function _createSecret (secretName, data) {
  const params = {
    Name: secretName,
    SecretString: JSON.stringify(data)
  }

  return new Promise((resolve, reject) => {
    secretsManager.createSecret(params, (err, data) => {
      if (err) {
        return reject(err)
      }

      return resolve(data)
    })
  })
}

/**
 * Update data
 *
 * @param {String} secretName
 * @param {Object} data
 *
 * @return {Promise<unknown>}
 * @private
 */
async function _updateSecret (secretName, data) {
  const params = {
    SecretId: secretName,
    SecretString: JSON.stringify(data)
  }

  return new Promise((resolve, reject) => {
    secretsManager.updateSecret(params, (err, data) => {
      if (err) {
        return reject(err)
      }

      return resolve(data)
    })
  })
}

/**
 * Remove secret data
 *
 * @param {String} secretName
 *
 * @return {Promise<unknown>}
 * @private
 */
async function _removeSecret (secretName) {
  const params = {
    RecoveryWindowInDays: 7,
    SecretId: secretName
  }

  return new Promise((resolve, reject) => {
    secretsManager.deleteSecret(params, (err, data) => {
      if (err) {
        return reject(err)
      }

      return resolve(data)
    })
  })
}

/**
 * Restore secret data after deletion
 *
 * @param secretName
 *
 * @return {Promise<unknown>}
 * @private
 */
async function _restoreSecret (secretName) {
  const params = {
    SecretId: secretName
  }

  return new Promise((resolve, reject) => {
    secretsManager.restoreSecret(params, (err, data) => {
      if (err) {
        return reject(err)
      }

      return resolve(data)
    })
  })
}

/** Get credentials from Secret Manager */
module.exports.getCredentials = async (key) => {
  const secretName = [consts.ENV, consts.PATH_MIDDLE_NAME, key].join('/')
  try {
    const secret = await _getSecret(secretName)

    return secret
  } catch (e) {
    if (e.code === AWS_INVALID_REQUEST_EXCEPTION) {
      return null
    }
    throw e
  }
}

/** Remove credentials from Secret Manager */
module.exports.removeCredentials = async (key) => {
  const secretName = [consts.ENV, consts.PATH_MIDDLE_NAME, key].join('/')
  try {
    await _removeSecret(secretName)

    return true
  } catch (e) {
    if (e.code === AWS_RESOURCE_NOT_FOUND_EXCEPTION) {
      return false
    }
    throw e
  }
}

/** Upsert Credentials Into Secret Manager */
module.exports.upsertCredentialsIntoSecretManager = async (key, data) => {
  const secretName = [consts.ENV, consts.PATH_MIDDLE_NAME, key].join('/')
  let secret = null

  try {
    secret = await _getSecret(secretName)
  } catch (e) {
    if (e.code !== AWS_INVALID_REQUEST_EXCEPTION) {
      throw e
    }

    await _restoreSecret(secretName)
    secret = await _getSecret(secretName)
  }

  if (!secret) {
    await _createSecret(secretName, data)
  }

  await _updateSecret(secretName, data)
}
