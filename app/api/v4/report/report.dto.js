const _config = require('../../../config/config.js')

module.exports.learnerReport = (userAvgMark, userStatistics, userResponsiveness, teamAvgMark, teamStatistics, teamResponsiveness) => {
  const current = userStatistics.find(el => el._id === 'current')
  const complete = userStatistics.find(el => el._id === 'complete')

  const currentTeam = teamStatistics.find(el => el._id === 'current')
  const completeTeam = teamStatistics.find(el => el._id === 'complete')

  let avgByScenario = []
  let responsivenessByScenario = []

  if (userAvgMark.length > 0 && teamAvgMark.length > 0) {
    avgByScenario = userAvgMark[0].data.map(user => {
      const team = teamAvgMark[0].data.find(el => el._id.toString() === user._id.toString())

      return {
        _id: team._id,
        name: user.name,
        team: team.avg ? team.avg : 0,
        user: user.avgMark ? user.avgMark : 0
      }
    })
  }

  if (userResponsiveness.length > 0 && teamResponsiveness.length > 0) {
    responsivenessByScenario = userResponsiveness[0].data.map(user => {
      const team = teamResponsiveness[0].data.find(el => el._id.toString() === user._scenario.toString())
      return {
        _id: team._id,
        name: team.name,
        team: team.responsiveness ? team.responsiveness : 0,
        user: user.responsiveness ? user.responsiveness : 0
      }
    })
  }

  return {
    user: {
      avgScore: userAvgMark.length > 0 ? userAvgMark[0].avgUserMark : 0,
      current: current ? current.sum : 0,
      complete: complete ? complete.sum : 0,
      responsiveness: (userResponsiveness.length > 0 && userResponsiveness[0].responsiveness)
        ? userResponsiveness[0].responsiveness : 0
    },
    team: {
      avgScore: teamAvgMark.length > 0 ? teamAvgMark[0].avgTeamMark : 0,
      current: currentTeam ? currentTeam.sum : 0,
      complete: completeTeam ? completeTeam.sum : 0,
      responsiveness: (teamResponsiveness.length > 0 && teamResponsiveness[0].responsiveness)
        ? teamResponsiveness[0].responsiveness : 0
    },
    avgByScenario,
    responsivenessByScenario
  }
}

module.exports.coachReport = (teamAvgMark, companyAvgMark, teamResponsiveness,
  companyResponsiveness, teamStatistics, scoreRanking, responsivenessRanking, user) => {
  const currentTeam = teamStatistics.find(el => el._id === 'current')
  const completeTeam = teamStatistics.find(el => el._id === 'complete')
  const currentPositionScore =
    scoreRanking.findIndex(el => el._id.toString() === user.toString())
  const currentPositionResponsiveness =
    responsivenessRanking.findIndex(el => el._id.toString() === user.toString())

  return {
    team: {
      avgScore: teamAvgMark.length > 0 ? teamAvgMark[0].avgTeamMark : 0,
      responsiveness: (teamResponsiveness.length > 0 && teamResponsiveness[0].responsiveness)
        ? teamResponsiveness[0].responsiveness : 0,
      current: currentTeam ? currentTeam.sum : 0,
      complete: completeTeam ? completeTeam.sum : 0,
      scoreRanking: {
        currentPosition: currentPositionScore + 1,
        total: scoreRanking.length
      },
      responsivenessRanking: {
        currentPosition: currentPositionResponsiveness + 1,
        total: responsivenessRanking.length
      }
    },
    company: {
      avgScore: companyAvgMark.length > 0 ? companyAvgMark[0].avgTeamMark : 0,
      responsiveness: (companyResponsiveness.length > 0 && companyResponsiveness[0].responsiveness)
        ? companyResponsiveness[0].responsiveness : 0
    }
  }
}

module.exports.coaches = (coaches) => {
  return coaches.map(c => {
    const user = c.toJSON()
    return {
      _id: user._id,
      name: user.name
    }
  })
}

module.exports.scenarioScores = (userScores, scenario, teamScores, learner, userAvgMark, teamAvgMark) => {
  let criterias = []
  let user

  criterias = userScores.map(user => {
    const team = teamScores.find(el => el._id.toString() === user._criteria._id.toString())
    return {
      _id: team._id,
      name: user._criteria.name,
      team: team.avg,
      user: user.mark
    }
  })

  if (learner) {
    learner = learner.toJSON()
    user = {
      _id: learner._id,
      company: learner._company.name,
      firstName: learner.firstName,
      lastName: learner.lastName,
      avatar_sm: learner.avatar_sm,
      avatar_md: learner.avatar_md,
      avatar_lg: learner.avatar_lg,
      avatarColor: learner.avatarColor
    }
  }

  return {
    scenarioName: scenario.name,
    scenarioId: scenario._id,
    userAvgScore: userAvgMark.length > 0 ? userAvgMark[0].avgUserMark : 0,
    teamAvgScore: teamAvgMark.length > 0 ? teamAvgMark[0].avgTeamMark : 0,
    user,
    criterias
  }
}

module.exports.userScoreList = (teamAvgMark, companyAvgMark, userList) => {
  return {
    teamAvgScore: teamAvgMark.length > 0 ? teamAvgMark[0].avgTeamMark : 0,
    companyAvgScore: companyAvgMark.length > 0 ? companyAvgMark[0].avgTeamMark : 0,
    users: userList.map(user => {
      return {
        _id: user.user._id,
        avgScore: user.avgMark ? user.avgMark : 0,
        firstName: user.user.firstName,
        lastName: user.user.lastName,
        avatar_sm: user.user.avatarId
          ? ('https://s3-' + _config.aws.region + '.amazonaws.com/' +
            _config.aws.photoBucket + '/public/' + 100 + '/' + user.user.avatarId +
            '.jpg') : null,
        avatarColor: user.user.avatarColor
      }
    })
  }
}

module.exports.userResponsivenessList = (teamResponsiveness, companyResponsiveness, userList) => {
  return {
    teamResponsiveness: (teamResponsiveness.length > 0 && teamResponsiveness[0].responsiveness)
      ? teamResponsiveness[0].responsiveness : 0,
    companyResponsiveness: (companyResponsiveness.length > 0 && companyResponsiveness[0].responsiveness)
      ? companyResponsiveness[0].responsiveness : 0,
    users: userList.map(user => {
      return {
        _id: user.user._id,
        responsiveness: user.responsiveness ? user.responsiveness : 0,
        firstName: user.user.firstName,
        lastName: user.user.lastName,
        avatar_sm: user.user.avatarId
          ? ('https://s3-' + _config.aws.region + '.amazonaws.com/' +
            _config.aws.photoBucket + '/public/' + 100 + '/' + user.user.avatarId +
            '.jpg') : null,
        avatarColor: user.user.avatarColor
      }
    })
  }
}

module.exports.scoreByScenario = (userAvgMark, teamAvgMark, learner) => {
  let avgByScenario = []

  if (userAvgMark.length > 0 && teamAvgMark.length > 0) {
    avgByScenario = userAvgMark[0].data.map(user => {
      const team = teamAvgMark[0].data.find(el => el._id.toString() === user._id.toString())
      if (team) {
        return {
          _id: team._id,
          scenarioName: user.name,
          team: team.avg ? team.avg : 0,
          user: user.avgMark ? user.avgMark : 0
        }
      }
    })
  }
  learner = learner.toJSON()
  return {
    userAvgScore: (userAvgMark.length > 0 && userAvgMark[0].avgUserMark) ? userAvgMark[0].avgUserMark : 0,
    teamAvgScore: (teamAvgMark.length > 0 && teamAvgMark[0].avgTeamMark) ? teamAvgMark[0].avgTeamMark : 0,
    user: {
      _id: learner._id,
      company: learner._company.name,
      firstName: learner.firstName,
      lastName: learner.lastName,
      avatar_sm: learner.avatar_sm,
      avatar_md: learner.avatar_md,
      avatar_lg: learner.avatar_lg,
      avatarColor: learner.avatarColor
    },
    avgByScenario
  }
}

module.exports.responsivenessByScenario = (userResponsiveness, teamResponsiveness, learner) => {
  let responsivenessByScenario = []

  if (userResponsiveness.length > 0 && teamResponsiveness.length > 0) {
    responsivenessByScenario = userResponsiveness[0].data.map(user => {
      const team = teamResponsiveness[0].data.find(el => el._id.toString() === user._scenario.toString())
      return {
        _id: team._id,
        scenarioName: team.name,
        team: team.responsiveness ? team.responsiveness : 0,
        user: user.responsiveness ? user.responsiveness : 0
      }
    })
  }
  learner = learner.toJSON()
  return {
    userResponsiveness: (userResponsiveness.length > 0 && userResponsiveness[0].responsiveness)
      ? userResponsiveness[0].responsiveness : 0,
    teamResponsiveness: (teamResponsiveness.length > 0 && teamResponsiveness[0].responsiveness)
      ? teamResponsiveness[0].responsiveness : 0,
    user: {
      _id: learner._id,
      company: learner._company.name,
      firstName: learner.firstName,
      lastName: learner.lastName,
      avatar_sm: learner.avatar_sm,
      avatar_md: learner.avatar_md,
      avatar_lg: learner.avatar_lg,
      avatarColor: learner.avatarColor
    },
    responsivenessByScenario
  }
}

module.exports.adminDashboard = (scenarioStatistic, coaches, learners,
  evaluations, avgScore, criterias, messages, thisWeek, previousWeek,
  thisMonth, previousMonth) => {
  const current = scenarioStatistic.find(el => el._id === 'current')
  const complete = scenarioStatistic.find(el => el._id === 'complete')

  return {
    coaches: coaches.length,
    learners: learners.length,
    evaluations: evaluations.length,
    criterias: criterias.length,
    scenariosInProgress: current ? current.sum : 0,
    scenariosClosed: complete ? complete.sum : 0,
    messages: messages.length,
    avgScore: {
      allPeriod: avgScore.length > 0 ? avgScore[0].avgTeamMark : 0,
      thisWeek: thisWeek.length > 0 ? thisWeek[0].avgTeamMark : 0,
      previousWeek: previousWeek.length > 0 ? previousWeek[0].avgTeamMark : 0,
      thisMonth: thisMonth.length > 0 ? thisMonth[0].avgTeamMark : 0,
      previousMonth: previousMonth.length > 0 ? previousMonth[0].avgTeamMark : 0
    }
  }
}

module.exports.adminCharts = (responsivenessStatistic, scenarioLengthStatistic) => {
  const withoutResponse = 1000 // number for correct sorting
  return {
    scenarioResponsiveness: {
      ranges: responsivenessStatistic.length > 0 ? responsivenessStatistic[0].data.map(obj => {
        if (obj.range && (obj.range.from === 0 || obj.range.from === withoutResponse)) { delete obj.range.from }
        if (obj.range) {
          return {...obj.range, count: obj.count}
        } else {
          return {count: obj.count}
        }
      }) : [],
      count: responsivenessStatistic.length > 0 ? responsivenessStatistic[0].count : 0
    },
    scenarioLength: {
      ranges: scenarioLengthStatistic.length > 0 ? scenarioLengthStatistic[0].data.map(obj => {
        return {...obj.range, count: obj.count}
      }) : [],
      count: scenarioLengthStatistic.length > 0 ? scenarioLengthStatistic[0].count : 0
    }
  }
}
