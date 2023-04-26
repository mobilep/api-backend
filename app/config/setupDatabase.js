'use strict'
require('dotenv').config()

const path = require('path')
const fs = require('fs')
const seedDatabase = (options) => {
  const seedsPath = options.seeds
  const modelPath = options.modelPath
  const seeders = fs.readdirSync(seedsPath)
  let seeder, model
  const promises = []
  seeders.forEach((file) => {
    seeder = require(seedsPath + '/' + file)
    model = require(modelPath + '/' + seeder.model)
    seeder.data.forEach((value) => {
      promises.push(
        model.findOneAndUpdate(
          {
            _id: value._id
          },
          value,
          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true
          }
        )
      )
    })
  })
  return Promise.all(promises)
}

// db connection and settings
const connection = require('./connection')
connection.getMongoose()

const seedsPath = path.join(__dirname, './seeds')
const apiPath = path.join(__dirname, './../api/v1')

const options = {
  seeds: seedsPath,
  apiPath: apiPath,
  modelPath: path.join(__dirname, '..')
}
seedDatabase(options).then(() => {
  process.exit()
}).catch((err) => {
  console.error(err)
  process.exit(1)
})
