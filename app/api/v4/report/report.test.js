'use strict'

const server = require('../../../index')
const chai = require('chai')
const chaiHttp = require('chai-http')
const mocha = require('mocha')

chai.should()
chai.use(chaiHttp)

describe('REPORT API v4', () => {
  let companyUser, notCompanyUser, coach, learnerReport, userResponsiveness
  const company = '57fe2450916165b0b8b20111'

  mocha.before((done) => {
    chai.request(server).put('/api/v4/auth').send({
      email: 'ggguser11@awesome.com',
      password: 'Qwerty123'
    }).end((err, res) => {
      chai.should().not.exist(err)
      res.body.should.have.property('accessToken')
      companyUser = res.body
      done()
    })
  })

  mocha.before((done) => {
    chai.request(server).put('/api/v4/auth').send({
      email: 'fffuser3@awesome.com',
      password: 'Qwerty0123'
    }).end((err, res) => {
      chai.should().not.exist(err)
      res.body.should.have.property('accessToken')
      notCompanyUser = res.body
      done()
    })
  })

  mocha.before((done) => {
    chai.request(server).put('/api/v4/auth').send({
      email: 'ggguser1@awesome.com',
      password: 'Qwerty0123'
    }).end((err, res) => {
      chai.should().not.exist(err)
      res.body.should.have.property('accessToken')
      coach = res.body
      done()
    })
  })

  describe('GET /api/v4/company/:companyId/report-learner', () => {
    it('should get learner report overview', (done) => {
      chai.request(server)
        .get('/api/v4/company/' + company + '/report-learner')
        .set('Authorization', companyUser.accessToken)
        .end((err, res) => {
          learnerReport = res.body
          chai.should().not.exist(err)
          res.should.have.status(200)
          chai.expect(res.body).to.be.an('object')
          chai.expect(res.body).to.have.property('user')
          chai.expect(res.body).to.have.property('team')
          chai.expect(res.body).to.have.property('avgByScenario')
          chai.expect(res.body).to.have.property('responsivenessByScenario')
          done()
        })
    })

    it('should get learner report overview with query params', (done) => {
      chai.request(server)
        .get('/api/v4/company/' + company + '/report-learner?coach=57fe2450916165b0b8b21111')
        .set('Authorization', companyUser.accessToken)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          chai.expect(res.body).to.be.an('object')
          chai.expect(res.body).to.have.property('user')
          chai.expect(res.body).to.have.property('team')
          chai.expect(res.body).to.have.property('avgByScenario')
          chai.expect(res.body).to.have.property('responsivenessByScenario')
          done()
        })
    })

    it('should not get learner report overview with invalid query params', (done) => {
      chai.request(server)
        .get('/api/v4/company/' + company + '/report-learner?from=aaaaa&to=bbbbb')
        .set('Authorization', companyUser.accessToken)
        .end((err, res) => {
          chai.should().exist(err)
          res.should.have.status(400)
          done()
        })
    })

    it('should not get learner report overview if not company user', (done) => {
      chai.request(server)
        .get('/api/v4/company/' + company + '/report-learner')
        .set('Authorization', notCompanyUser.accessToken)
        .end((err, res) => {
          chai.should().exist(err)
          res.should.have.status(403)
          done()
        })
    })
  })

  describe('GET /api/v4/company/:companyId/scenario-learner/:scenarioId', () => {
    it('should get learner scenario score details', (done) => {
      const scenario = learnerReport.responsivenessByScenario[0]._id
      chai.request(server)
        .get('/api/v4/company/' + company + '/scenario-learner/' + scenario)
        .set('Authorization', companyUser.accessToken)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          chai.expect(res.body).to.be.an('object')
          chai.expect(res.body).to.have.property('scenarioName')
          chai.expect(res.body).to.have.property('userAvgScore')
          chai.expect(res.body).to.have.property('teamAvgScore')
          chai.expect(res.body).to.have.property('criterias')
          done()
        })
    })
  })

  describe('GET /api/v4/company/:companyId/report-coach', () => {
    it('should get coach report overview', (done) => {
      chai.request(server)
        .get('/api/v4/company/' + company + '/report-coach')
        .set('Authorization', coach.accessToken)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          chai.expect(res.body).to.be.an('object')
          chai.expect(res.body).to.have.property('team')
          chai.expect(res.body).to.have.property('company')
          done()
        })
    })

    it('should not get coach report overview with invalid query params', (done) => {
      chai.request(server)
        .get('/api/v4/company/' + company + '/report-coach?from=aaaaa&to=bbbbb')
        .set('Authorization', coach.accessToken)
        .end((err, res) => {
          chai.should().exist(err)
          res.should.have.status(400)
          done()
        })
    })
  })

  describe('GET /api/v4/company/:companyId/report-coach/user-score', () => {
    it('should get users scores list', (done) => {
      chai.request(server)
        .get('/api/v4/company/' + company + '/report-coach/user-score')
        .set('Authorization', coach.accessToken)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          chai.expect(res.body).to.be.an('object')
          chai.expect(res.body).to.have.property('teamAvgScore')
          chai.expect(res.body).to.have.property('companyAvgScore')
          chai.expect(res.body).to.have.property('users')
          done()
        })
    })

    it('should not get users scores list with invalid query params', (done) => {
      chai.request(server)
        .get('/api/v4/company/' + company + '/report-coach/user-score?from=aaaaa&to=bbbbb')
        .set('Authorization', coach.accessToken)
        .end((err, res) => {
          chai.should().exist(err)
          res.should.have.status(400)
          done()
        })
    })
  })

  describe('GET /api/v4/company/:companyId/report-coach/user-responsiveness', () => {
    it('should get users responsiveness list', (done) => {
      chai.request(server)
        .get('/api/v4/company/' + company + '/report-coach/user-responsiveness')
        .set('Authorization', coach.accessToken)
        .end((err, res) => {
          userResponsiveness = res.body
          chai.should().not.exist(err)
          res.should.have.status(200)
          chai.expect(res.body).to.be.an('object')
          chai.expect(res.body).to.have.property('teamResponsiveness')
          chai.expect(res.body).to.have.property('companyResponsiveness')
          chai.expect(res.body).to.have.property('users')
          done()
        })
    })

    it('should not get users responsiveness list with invalid query params', (done) => {
      chai.request(server)
        .get('/api/v4/company/' + company + '/report-coach/user-responsiveness?from=aaaaa&to=bbbbb')
        .set('Authorization', coach.accessToken)
        .end((err, res) => {
          chai.should().exist(err)
          res.should.have.status(400)
          done()
        })
    })
  })

  describe('GET /api/v4/company/:companyId/report-coach/user-responsiveness/:userId', () => {
    it('should get team member responsiveness details', (done) => {
      const user = userResponsiveness.users[0]._id
      chai.request(server)
        .get('/api/v4/company/' + company + '/report-coach/user-responsiveness/' + user)
        .set('Authorization', coach.accessToken)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          chai.expect(res.body).to.be.an('object')
          done()
        })
    })

    it('should not get team member responsiveness details with invalid query params', (done) => {
      const user = userResponsiveness.users[0]._id
      chai.request(server)
        .get('/api/v4/company/' + company + '/report-coach/user-responsiveness/' + user + '?from=aaaaa&to=bbbbb')
        .set('Authorization', coach.accessToken)
        .end((err, res) => {
          chai.should().exist(err)
          res.should.have.status(400)
          done()
        })
    })

    it('should not get team member responsiveness details if not company user', (done) => {
      const user = notCompanyUser._id
      chai.request(server)
        .get('/api/v4/company/' + company + '/report-coach/user-responsiveness/' + user)
        .set('Authorization', coach.accessToken)
        .end((err, res) => {
          chai.should().exist(err)
          res.should.have.status(403)
          done()
        })
    })
  })

  describe('GET /api/v4/company/:companyId/coach', () => {
    it('should get list of user coaches', (done) => {
      chai.request(server)
        .get('/api/v4/company/' + company + '/coach')
        .set('Authorization', companyUser.accessToken)
        .end((err, res) => {
          learnerReport = res.body
          chai.should().not.exist(err)
          res.should.have.status(200)
          chai.expect(res.body).to.be.an('array')
          done()
        })
    })
  })
})
