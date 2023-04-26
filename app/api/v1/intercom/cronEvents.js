const cron = require('node-cron')

const intercomEmitter = require('./IntercomEmitter')
const daoCompany = require('../company/company.dao')
const daoScenario = require('../scenario/scenario.dao')
const daoUser = require('../user/user.dao')
const daoPractice = require('../practice/practice.dao')

const updateCompanies = async () => {
  try {
    const companies = await daoCompany.find()
    companies.forEach(async (company) => {
      const stats = {
        assigned: 0,
        current: 0,
        completed: 0,
        avgMark: 0,
        hasUserMarks: 0,
        messagesCount: 0,
        videosCount: 0,
        marks: 0
      }
      company = company.toObject()
      const scenarios = (await daoScenario.getByCompany(company._id)).filter(e => e.isActive)
      scenarios.forEach(scenario => {
        if (scenario.type === 'complete') {
          stats.completed++
        } else if (scenario.type === 'current') {
          stats.current++
        }
      })
      for (let scenario of scenarios) {
        const practices = (await daoPractice.getByScenario(scenario._id)).filter(e => e.isActive)
        stats.assigned = scenarios.length

        let practicesCount = 0
        let marks = 0
        practices.forEach((practice) => {
          if (practice.userMark.length > 0) {
            practice.userMark.forEach((userMark) => {
              marks += userMark.mark
              practicesCount++
            })
          }
        })
        if (practicesCount > 0) {
          stats.marks += marks / practicesCount
          stats.hasUserMarks++
        }
      }
      if (stats.hasUserMarks > 0) {
        stats.avgMark = stats.marks / stats.hasUserMarks
      }

      const users = await daoUser.get({_company: company._id})
      users.forEach(user => {
        stats.messagesCount += user.messagesCount || 0
        stats.videosCount += user.videosCount || 0
      })
      intercomEmitter.emit('updateCompany', {company, stats})
    })
  } catch (e) {
    throw e
  }
}

module.exports.run = () => cron.schedule('00 59 * * * *', updateCompanies, true)
