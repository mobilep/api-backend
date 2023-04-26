const config = {
  database: process.env.DATABASE,
  api: process.env.API,
  currentApi: process.env.CURRENT_API,
  web: process.env.WEB,
  webClient: process.env.WEB_CLIENT,
  seed: process.env.SEED === 'true',
  token: process.env.TOKEN,
  debug: process.env.DEBUG === 'true',
  intercomAppId: process.env.INTERCOM_APP_ID,
  intercomAccessToken: process.env.INTERCOM_ACCESS_TOKEN,
  migrationKey: process.env.MIGRATION_KEY,
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    photoBucket: process.env.AWS_PHOTO_BUCKET,
    inboxPhotoBucket: process.env.AWS_INBOX_PHOTO_BUCKET,
    videoBucket: process.env.AWS_VIDEO_BUCKET,
    fileBucket: process.env.AWS_FILE_BUCKET,
    audioBucket: process.env.AWS_AUDIO_BUCKET,
    APPLICATION_ARN: process.env.AWS_APPLICATION_ARN
  },
  firebase: {
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    serviceAccount: {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: Buffer.from(process.env.FIREBASE_PRIVATE_KEY, 'base64').toString('utf8'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://accounts.google.com/o/oauth2/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
    }
  },
  tom: {
    api: process.env.TOM_API,
    apiKey: process.env.TOM_API_KEY,
    apiSecret: process.env.TOM_API_SECRET,
    appName: process.env.TOM_APP_NAME
  },
  appleAppSiteAssociation: {
    'applinks': {
      'apps': [],
      'details': [
        {
          'appID': process.env.APPLE_APP_ID,
          'paths': [
            '/api/*'
          ]
        }
      ]
    }
  },
  androidAssetLinks: [{
    'relation': ['delegate_permission/common.handle_all_urls'],
    'target': {
      'namespace': 'android_app',
      'package_name': process.env.ANDROID_APP_NAME,
      'sha256_cert_fingerprints': [process.env.ANDROIND_FINGERPRINT]
    }
  }]
}

module.exports = config
