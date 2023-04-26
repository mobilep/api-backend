'use strict'

const server = require('../../../index')
const chai = require('chai')
const chaiHttp = require('chai-http')
const mocha = require('mocha')

chai.should()
chai.use(chaiHttp)

describe('TEAM API v4', () => {
  let companyUser, notCompanyUser
  const company = '57fe2450916165b0b8b20111'
  const team1 = '588079f49b81d0648ec3b001'
  mocha.before((done) => {
    chai.request(server).put('/api/v4/auth').send({
      email: 'ggguser1@awesome.com',
      password: 'Qwerty0123'
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
  describe('POST /api/v4/company/:companyId/team', () => {
    it('should create team for the company', (done) => {
      const data = {
        name: 'Test team',
        _users: []
      }

      chai.request(server)
        .post('/api/v4/company/' + company + '/team')
        .set('Authorization', companyUser.accessToken)
        .send(data)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.should.have.property('name')
          res.body.name.should.be.equal(data.name)
          res.body._users.should.be.deep.equal(data._users)
          done()
        })
    })
    it('should not create team for the company if not company user',
      (done) => {
        const data = {
          name: 'Test team',
          _users: []
        }

        chai.request(server)
          .post('/api/v4/company/' + company + '/team')
          .set('Authorization', notCompanyUser.accessToken)
          .send(data)
          .end((err, res) => {
            chai.should().exist(err)
            res.should.have.status(403)
            done()
          })
      })
    it('should not create team for the company if such name already exists',
      (done) => {
        const data = {
          name: 'Existing team',
          _users: []
        }

        chai.request(server)
          .post('/api/v4/company/' + company + '/team')
          .set('Authorization', companyUser.accessToken)
          .send(data)
          .end((err, res) => {
            chai.should().exist(err)
            res.should.have.status(400)
            done()
          })
      })
  })

  describe('PATCH /api/v4/company/:companyId/team/:teamId', () => {
    it('should edit team for the company', (done) => {
      const data = {
        name: 'Test team change',
        _users: ['57fe2450916165b0b8b21112']
      }

      chai.request(server)
        .patch('/api/v4/company/' + company + '/team/' + team1)
        .set('Authorization', companyUser.accessToken)
        .send(data)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.should.have.property('name')
          res.body.name.should.be.equal(data.name)
          res.body._users[0]._id.should.be.equal(data._users[0])
          done()
        })
    })
    it('should not edit team for the company to existsing name', (done) => {
      const data = {
        name: 'Existing team',
        _users: 'Test team _users change'
      }

      chai.request(server)
        .patch('/api/v4/company/' + company + '/team/' + team1)
        .set('Authorization', companyUser.accessToken)
        .send(data)
        .end((err, res) => {
          chai.should().exist(err)
          res.should.have.status(400)
          done()
        })
    })
    it('should not edit team for the company if not company user',
      (done) => {
        const data = {
          name: 'Test team update 2',
          _users: 'Test team _users 222'
        }

        chai.request(server)
          .patch('/api/v4/company/' + company + '/team/' + team1)
          .set('Authorization', notCompanyUser.accessToken)
          .send(data)
          .end((err, res) => {
            chai.should().exist(err)
            res.should.have.status(403)
            done()
          })
      })
  })

  describe('GET /api/v4/company/:companyId/team', () => {
    it('should get teams for the company', (done) => {
      chai.request(server)
        .get('/api/v4/company/' + company + '/team')
        .set('Authorization', companyUser.accessToken)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          res.body.should.be.an('array')
          res.body[0].should.have.property('name')
          done()
        })
    })
    it('should not get teams for the company if not company user',
      (done) => {
        chai.request(server)
          .get('/api/v4/company/' + company + '/team')
          .set('Authorization', notCompanyUser.accessToken)
          .end((err, res) => {
            chai.should().exist(err)
            res.should.have.status(403)
            done()
          })
      })
  })

  describe('GET /api/v4/company/:companyId/team/:teamId', () => {
    it('should get teams for the company', (done) => {
      chai.request(server)
        .get('/api/v4/company/' + company + '/team/588079f49b81d0648ec3b000')
        .set('Authorization', companyUser.accessToken)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.should.have.property('name')
          done()
        })
    })

    it('should not get teams for the company if not company user',
      (done) => {
        chai.request(server)
          .get('/api/v4/company/' + company + '/team/588079f49b81d0648ec3b000')
          .set('Authorization', notCompanyUser.accessToken)
          .end((err, res) => {
            chai.should().exist(err)
            res.should.have.status(403)
            done()
          })
      })

    it('should not get teams for the company if not company team',
      (done) => {
        chai.request(server)
          .get('/api/v4/company/' + company + '/team/588079f49b81d0648ec3b003')
          .set('Authorization', companyUser.accessToken)
          .end((err, res) => {
            chai.should().exist(err)
            res.should.have.status(403)
            done()
          })
      })
  })

  describe('delete /api/v4/company/:companyId/team/:teamId', () => {
    it('should delete team for the company', (done) => {
      chai.request(server)
        .delete('/api/v4/company/' + company + '/team/' + team1)
        .set('Authorization', companyUser.accessToken)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          res.body.should.be.an('object')
          done()
        })
    })
    it('should not delete team for the company if not company user',
      (done) => {
        chai.request(server)
          .delete('/api/v4/company/' + company + '/team/' + team1)
          .set('Authorization', notCompanyUser.accessToken)
          .end((err, res) => {
            chai.should().exist(err)
            res.should.have.status(403)
            done()
          })
      })
  })
})
