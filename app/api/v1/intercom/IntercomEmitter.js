/* eslint-disable camelcase */
const EventEmitter = require('eventemitter2').EventEmitter2
const client = require('intercom-client').client

class IntercomEmitter extends EventEmitter {}

const intercomEmitter = new IntercomEmitter()

module.exports = intercomEmitter

intercomEmitter.on('createCompany', createCompany)
intercomEmitter.on('updateCompany', updateCompany)
intercomEmitter.on('deleteCompany', deleteCompany)

intercomEmitter.on('createUser', createUser)
intercomEmitter.on('updateUser', updateUser)
intercomEmitter.on('deleteUser', deleteUser)

intercomEmitter.on('user-sign-in', userSignsIn)
intercomEmitter.on('user-signs-out', userSignsOut)
intercomEmitter.on('user-assigned-to-practice', userAssignedToPractice)

intercomEmitter.on('scenario-draft-created', scenarioDraftCreated)
intercomEmitter.on('scenario-sent', ScenarioSent)
intercomEmitter.on('scenario-coach-evaluates-learner', scenarioCoachEvaluates)
intercomEmitter.on('scenario-learner-evaluates', scenarioLearnerEvaluates)
intercomEmitter.on('scenario-video-uploaded-by-learner', videoUploadedByLearner)
intercomEmitter.on('scenario-video-uploaded-by-coach', videoUploadedByCoach)

intercomEmitter.on('group-created', groupCreated)
intercomEmitter.on('best-practice-selected', bestPracticeSelected)

async function createCompany (data) {
  try {
    await client.companies.create({
      company_id: data._id,
      name: data._company
    })
  } catch (e) {
    errorHandler(e, this.event)
  }
}

async function updateCompany (data) {
  try {
    const {company, stats} = data
    await client.companies.update({
      company_id: company._id,
      name: company._name,
      custom_attributes: {
        scenarios_assigned: (stats.current + stats.completed),
        scenarios_complete: stats.completed,
        scenarios_incomplete: stats.current,
        messages_sent: stats.messagesCount,
        videos_sent: stats.videosCount,
        scenarios_rating: Math.round(stats.avgMark * 10) / 10
      }
    })
  } catch (e) {
    errorHandler(e, this.event)
  }
}

async function deleteCompany (data) {
  try {
    await client.companies.delete({
      company_id: data.id
    })
  } catch (e) {
    errorHandler(e, this.event)
  }
}

async function createUser (data) {
  try {
    const user = {
      email: data.email,
      user_id: data._id,
      name: data.firstName + ' ' + data.lastName,
      signed_up_at: (Math.round(new Date() / 1000))
    }
    if (data._company && data._company !== '') {
      user.companies = []
      user.companies.push({
        company_id: data._company._id,
        name: data._company.name
      })
    }
    await client.users.create(user)
  } catch (e) {
    errorHandler(e, this.event)
  }
}

async function updateUser (data) {
  try {
    await client.users.update({
      user_id: data._id,
      email: data.email,
      update_last_request_at: true,
      custom_attributes: {
        scenarios_assigned: (data.practicingScenarios.current + data.practicingScenarios.completed),
        scenarios_complete: data.practicingScenarios.completed,
        scenarios_incomplete: data.practicingScenarios.current,
        scenarios_rating: data.practicingScenarios.avgMark,
        messages_sent: data.stats.messages_sent,
        videos_sent: data.stats.videos_sent
      }
    })
  } catch (e) {
    errorHandler(e, this.event)
  }
}

async function deleteUser (data) {
  try {
    await client.users.delete({
      user_id: data.id
    })
  } catch (e) {
    errorHandler(e, this.event)
  }
}

async function userSignsIn (data) {
  try {
    await client.events.create({
      event_name: this.event,
      user_id: data._id,
      email: data.email,
      created_at: (Math.round(new Date() / 1000)),
      metadata: {}
    })
  } catch (e) {
    errorHandler(e, this.event)
  }
}

async function userSignsOut (data) {
  try {
    await client.events.create({
      event_name: this.event,
      user_id: data._id,
      email: data.email,
      created_at: (Math.round(new Date() / 1000)),
      metadata: {}
    })
  } catch (e) {
    errorHandler(e, this.event)
  }
}

async function userAssignedToPractice (data) {
  try {
    await client.events.create({
      event_name: this.event,
      user_id: data._user._id,
      created_at: (Math.round(new Date() / 1000)),
      metadata: {
        scenario_id: data._scenario._id,
        scenario_name: data._scenario.name,
        coach_id: data._coach._id,
        coach_name: data._coach.firstName + ' ' + data._coach.lastName
      }
    })
  } catch (e) {
    errorHandler(e, this.event)
  }
}

async function scenarioDraftCreated (data) {
  try {
    await client.events.create({
      event_name: this.event,
      user_id: data._coach._id,
      created_at: (Math.round(new Date() / 1000)),
      metadata: {
        scenario_id: data._id,
        scenario_name: data.name
      }
    })
  } catch (e) {
    errorHandler(e, this.event)
  }
}

async function ScenarioSent (data) {
  try {
    await client.events.create({
      event_name: this.event,
      user_id: data._coach._id,
      created_at: (Math.round(new Date() / 1000)),
      metadata: {
        scenario_id: data._id,
        scenario_name: data.name,
        number_of_users: data._users.length
      }
    })
  } catch (e) {
    errorHandler(e, this.event)
  }
}

async function scenarioCoachEvaluates ({practice, avgMark}) {
  try {
    await client.events.create({
      event_name: this.event,
      user_id: practice._user._id,
      created_at: (Math.round(new Date() / 1000)),
      metadata: {
        scenario_id: practice._scenario._id,
        scenario_name: practice._scenario.name,
        rating: avgMark,
        coach_id: practice._coach._id,
        coach_name: (practice._coach.firstName + ' ' + practice._coach.lastName)
      }
    })
  } catch (e) {
    errorHandler(e, this.event)
  }
}

async function scenarioLearnerEvaluates ({practice, avgMark}) {
  try {
    await client.events.create({
      event_name: this.event,
      user_id: practice._coach._id,
      created_at: (Math.round(new Date() / 1000)),
      metadata: {
        scenario_id: practice._scenario._id,
        scenario_name: practice._scenario.name,
        rating: avgMark,
        learner_id: practice._user._id,
        learner_name: (practice._user.firstName + ' ' + practice._user.lastName)
      }
    })
  } catch (e) {
    errorHandler(e, this.event)
  }
}

async function videoUploadedByLearner ({id, practice, video}) {
  try {
    await client.events.create({
      event_name: this.event,
      user_id: id,
      created_at: (Math.round(new Date() / 1000)),
      metadata: {
        scenario_id: practice._scenario._id,
        scenario_name: practice._scenario.name,
        duration: Math.trunc(video.duration),
        size: video.size,
        coach_id: practice._coach._id,
        coach_name: practice._coach.firstName + ' ' + practice._coach.lastName
      }
    })
  } catch (e) {
    errorHandler(e, this.event)
  }
}

async function videoUploadedByCoach ({id, practice, video}) {
  try {
    await client.events.create({
      event_name: this.event,
      user_id: id,
      created_at: (Math.round(new Date() / 1000)),
      metadata: {
        scenario_id: practice._scenario._id,
        scenario_name: practice._scenario.name,
        duration: video.duration,
        size: video.size,
        coach_id: practice._coach._id,
        coach_name: practice._coach.name
      }
    })
  } catch (e) {
    errorHandler(e, this.event)
  }
}

async function groupCreated (data) {
  try {
    await client.events.create({
      event_name: this.event,
      user_id: data._owner,
      created_at: (Math.round(new Date() / 1000)),
      metadata: {
        group_name: data.name,
        number_of_users: data._users.length
      }
    })
  } catch (e) {
    errorHandler(e, this.event)
  }
}

async function bestPracticeSelected (data) {
  try {
    await client.events.create({
      event_name: this.event,
      user_id: data._user._id,
      created_at: (Math.round((data.time || new Date()) / 1000)),
      metadata: {
        scenario_id: data._scenario._id,
        name: data.name,
        duration: Math.trunc(data.video.duration),
        size: data.video.size || 0,
        learner_id: data._user._id,
        learner_name: data._user.firstName + ' ' + data._user.lastName
      }
    })
  } catch (e) {
    errorHandler(e, this.event)
  }
}

const errorHandler = (e, event) => {
  const error = e
  console.log('Event Name: ', event)
  console.log('Status: ' + error.statusCode)
  if (error.body) {
    error.body.errors.forEach((err) => {
      console.log('Error code: ' + err.code)
      console.log('Error description: ' + err.message)
    })
  } else {
    console.log(error)
  }
}
