const admin = require('firebase-admin')
// Fetch the service account key JSON file contents

const serviceAccount = (require('./../../config/_config.json')['local']).firebase.serviceAccount

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: (require('./../../config/_config.json')['local']).firebase.databaseURL
})

// db connection and settings
const connection = require('../../config/connection')
connection.getMongoose()

const MPChat = require('./index')

const user = {
  '_id': '5a9567406dbe9826fbdab582',
  'updatedAt': '2018-03-12T10:20:08.500Z',
  'createdAt': '2018-02-27T14:12:16.489Z',
  'firstName': 'Michelangelo',
  'lastName': 'Tyson',
  'password': 'a642a77abd7d4f51bf9226ceaf891fcbb5b299b8',
  'country': 'Ukraine',
  'postcode': '1421421',
  'videosCount': 0,
  'messagesCount': 0,
  'devices': [],
  'isActive': true,
  'avatarColor': '58c9ef',
  'magicToken': null,
  'resetToken': null,
  'extraInformation': [],
  'lang': 'en',
  'isSysAdmin': true,
  'isCompanyAdmin': false,
  'email': 'qwerty@gmail.com',
  '__v': 0,
  'firstLogIn': '2018-03-12T10:20:08.495Z'}

describe('MPChat', () => {
  it('should create chat', async () => {
    const chat = new MPChat()
    await chat.create({_moderator: '5d5e62e741efb46d8fe45a0c'})
  })
})

describe('MPChat', () => {
  it('should add new user to chat', async () => {
    const chat = new MPChat()
    await chat.init('5d788ad3648ed6077f8c4255')
    await chat.addUser('5d5e61c041efb46d8fe45a09')
  })
})

describe('MPChat', () => {
  it('should delete user from chat', async () => {
    const chat = new MPChat()
    await chat.init('5d773deec452420f923fad7c')
    await chat.removeUser('5d5e597d41efb46d8fe45a06')
  })
})

describe('MPChat', () => {
  it('should send message', async () => {
    const chat = new MPChat()
    await chat.init('5d760ee9f127c3d967423334')
    await chat.addMessage({content: 'test'}, user)
  })
})

describe('MPChat', () => {
  it('should delete message', async () => {
    const chat = new MPChat()
    await chat.init('5d773deec452420f923fad7c')
    await chat.removeMessage('-LoUxnNj-7KzzUKXNspp', user)
  })
})

describe('MPChat', () => {
  it('should find chats', async () => {
    return MPChat.findAll({type: 'practice'})
  })
})
