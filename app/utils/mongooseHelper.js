'use strict'

const fs = require('fs')

module.exports.seedDatabase = (options) => {
  const seedsPath = options.seeds
  const appPath = options.appPath
  const mongoose = options.mongoose

  const seeders = fs.readdirSync(seedsPath)
  return mongoose.connection.dropDatabase().then(() => {
    let seeder, model
    const promises = []
    seeders.forEach((file) => {
      seeder = require(seedsPath + '/' + file)
      model = require(appPath + '/' + seeder.model)
      promises.push(new Promise((resolve, reject) => {
        model.create(seeder.data, (err) => {
          if (err) reject(err)
          resolve()
        })
      }))
    })
    return Promise.all(promises)
  })
}
