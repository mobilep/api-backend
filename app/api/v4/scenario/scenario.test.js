'use strict'

const server = require('../../../index')
const chai = require('chai')
const chaiHttp = require('chai-http')
const mocha = require('mocha')

chai.should()
chai.use(chaiHttp)

describe('SCENARIO API v4', () => {
  let companyUser, notCompanyUser
  const company = '57fe2450916165b0b8b20111'

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
  describe('POST /api/v4/company/:companyId/scenario', () => {
    it('should create scenario for the company', (done) => {
      const data = {
        name: '',
        info: '',
        steps: ['step 1', ''],
        videoId: 'EB554C06-9ABC-48B7-BC8F-C8C2E258C641',
        _criterias: ['574e3a50616165b0b8b20111', '574e3a50616165b0b8b20222'],
        _users: ['57fe2450916165b0b8b21112', '57fe2450916165b0b8b21113']
      }
      chai.request(server)
        .post('/api/v4/company/' + company + '/scenario')
        .set('Authorization', companyUser.accessToken)
        .send(data)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.videoId.should.be.equal(data.videoId)
          res.body._coach._id.should.be.equal(companyUser._id)
          chai.expect(res.body.steps).to.have.all.members(data.steps)
          res.body._criterias.length.should.be.equal(2)
          res.body._users.length.should.be.equal(2)
          done()
        })
    })
    it('should not create scenario for the company if not company user',
      (done) => {
        const data = {
          name: 'Test criteria',
          info: 'Test criteria info',
          steps: ['step 1', 'step 2'],
          videoId: 'EB554C06-9ABC-48B7-BC8F-C8C2E258C641',
          _criterias: ['592b3eef97c0ba1a8ac5213b', '592b3eef97c0ba1a8ac5213a'],
          _users: ['57fe2450916165b0b8b21112', '57fe2450916165b0b8b21113']
        }

        chai.request(server)
          .post('/api/v4/company/' + company + '/scenario')
          .set('Authorization', notCompanyUser.accessToken)
          .send(data)
          .end((err, res) => {
            chai.should().exist(err)
            res.should.have.status(403)
            done()
          })
      })
    it('should not create scenario for the company if such name already exists',
      (done) => {
        const data = {
          name: 'Existing scenario',
          info: 'Test scenario info',
          steps: ['step 1', 'step 2'],
          videoId: 'EB554C06-9ABC-48B7-BC8F-C8C2E258C641',
          _criterias: ['592b3eef97c0ba1a8ac5213b', '592b3eef97c0ba1a8ac5213a'],
          _users: ['57fe2450916165b0b8b21112', '57fe2450916165b0b8b21113']
        }

        chai.request(server)
          .post('/api/v4/company/' + company + '/scenario')
          .set('Authorization', companyUser.accessToken)
          .send(data)
          .end((err, res) => {
            chai.should().not.exist(err)
            res.should.have.status(200)
            done()
          })
      })
  })
  describe('PATCH /api/v4/company/:companyId/scenario/:scenarioId', () => {
    it('should update scenario', (done) => {
      const data = {
        name: 'Company presentation',
        info: 'details of the scenario',
        steps: ['step 1', 'step 2', 'step 3'],
        examples: [
          {
            videoId: 'EB554C06-9ABC-48B7-BC8F-C8C2E258C643',
            duration: 100.6,
            size: 100,
            name: 'Name'
          }],
        videoId: 'EB554C06-9ABC-48B7-BC8F-C8C2E258C642',
        _criterias: ['574e3a50616165b0b8b20111', '574e3a50616165b0b8b20222'],
        _users: ['57fe2450916165b0b8b21112', '57fe2450916165b0b8b21113']
      }

      chai.request(server)
        .patch('/api/v4/company/' + company +
          '/scenario/574e3a50616165b0b8b55333')
        .set('Authorization', companyUser.accessToken)
        .send(data)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.should.have.property('name')
          res.body.name.should.be.equal(data.name)
          res.body.info.should.be.equal(data.info)
          res.body.videoId.should.be.equal(data.videoId)
          res.body._coach._id.should.be.equal(companyUser._id)
          chai.expect(res.body.steps).to.have.all.members(data.steps)
          res.body._criterias.length.should.be.equal(2)
          res.body._users.length.should.be.equal(2)
          done()
        })
    })
  })
  describe('POST /api/v4/company/:companyId/scenario/:scenarioId/examples',
    () => {
      it('should push best practice to scenario', (done) => {
        const data = {
          videoId: 'EB554C06-9ABC-48B7-BC8F-C8C2E258C644',
          duration: 100.6,
          size: 100,
          name: 'Name'
        }
        chai.request(server)
          .post('/api/v4/company/' + company +
            '/scenario/574e3a50616165b0b8b55333/examples')
          .set('Authorization', companyUser.accessToken)
          .send(data)
          .end((err, res) => {
            chai.should().not.exist(err)
            res.should.have.status(200)
            res.body.should.be.an('object')
            res.body.should.have.property('name')
            done()
          })
      })
    })
  describe('DELETE /api/v4/company/:companyId/scenario/:scenarioId', () => {
    it('should delete scenario for the company', (done) => {
      chai.request(server)
        .delete('/api/v4/company/' + company +
          '/scenario/574e3a50616165b0b8b55333')
        .set('Authorization', companyUser.accessToken)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(204)
          res.body.should.be.an('object')
          done()
        })
    })
    it('should not delete scenario for the company if not company user',
      (done) => {
        chai.request(server)
          .delete('/api/v4/company/' + company +
            '/scenario/574e3a50616165b0b8b55333')
          .set('Authorization', notCompanyUser.accessToken)
          .end((err, res) => {
            chai.should().exist(err)
            res.should.have.status(403)
            done()
          })
      })
  })
  describe('GET /api/v4/company/:companyId/scenario', () => {
    it('should get scenario for the company', (done) => {
      chai.request(server)
        .get('/api/v4/company/' + company + '/scenario')
        .set('Authorization', companyUser.accessToken)
        .end((err, res) => {
          console.log(res)
          chai.should().not.exist(err)
          res.should.have.status(200)
          chai.expect(res.body).to.be.an('array')
          done()
        })
    })
    it('should not list scenario for the company if not company user',
      (done) => {
        chai.request(server)
          .get('/api/v4/company/' + company + '/scenario')
          .set('Authorization', notCompanyUser.accessToken)
          .end((err, res) => {
            chai.should().exist(err)
            res.should.have.status(403)
            done()
          })
      })
  })
})
