require('../../../index')
const daoUsers = require('../user/user.dao')
const intercomEmitter = require('./IntercomEmitter')

const synchronize = async () => {
  const users = await daoUsers.getAll({})
  const times = Math.floor(users.length / 81)
  setInterval(() => {
    for (let i = 0; i <= 81; i++) {
      console.log(users[0])
      if (users.length === 0) {
        setTimeout(() => process.exit(), times * 11000)
        break
      }
      intercomEmitter.emit('createUser', users[0])
      users.splice(0, 1)
    }
  },
  11000)
}

synchronize()
