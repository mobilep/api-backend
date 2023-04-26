'use strict'

const server = require('../../../index')
const chai = require('chai')
const chaiHttp = require('chai-http')
const mocha = require('mocha')

chai.should()
chai.use(chaiHttp)

describe('Practice API v1', () => {
  let companyUser, notCompanyUser, coach
  const company = '57fe2450916165b0b8b20111'

  mocha.before((done) => {
    chai.request(server).put('/api/v1/auth').send({
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
    chai.request(server).put('/api/v1/auth').send({
      email: 'ggguser1@awesome.com',
      password: 'Qwerty0123'
    }).end((err, res) => {
      chai.should().not.exist(err)
      res.body.should.have.property('accessToken')
      coach = res.body
      done()
    })
  })

  mocha.before((done) => {
    chai.request(server).put('/api/v1/auth').send({
      email: 'fffuser3@awesome.com',
      password: 'Qwerty0123'
    }).end((err, res) => {
      chai.should().not.exist(err)
      res.body.should.have.property('accessToken')
      notCompanyUser = res.body
      done()
    })
  })

  describe(
    'PATCH /api/v1/company/:companyId/scenario/:scenarioId/practices/practiceId',
    () => {
      // TODO: add correct seeds to pass test
      it('user should update practice', (done) => {
        const data = {
          userMark: [
            {_criteria: null, mark: 3},
            {_criteria: null, mark: 5}
          ]
        }
        chai.request(server)
          .patch('/api/v1/company/' + company +
            '/scenario/574e3a50616165b0b8b55555/practice/59513f2d48cd027d92bc2301')
          .set('Authorization', companyUser.accessToken)
          .send(data)
          .end((err, res) => {
            chai.should().not.exist(err)
            /*
             res.should.have.status(200)
             res.body.should.be.an('object')
             res.body.should.have.property('userMark')
             res.body.userMark.length.should.equal(2)
             */
            done()
          })
      })

      it('coach should update practice', (done) => {
        const data = {
          coachMark: [
            {_criteria: '574e3a50616165b0b8b20111', mark: 4},
            {_criteria: '574e3a50616165b0b8b20222', mark: 5}
          ]
        }
        chai.request(server)
          .patch('/api/v1/company/' + company +
            '/scenario/574e3a50616165b0b8b55555/practice/59513f2d48cd027d92bc2301')
          .set('Authorization', coach.accessToken)
          .send(data)
          .end((err, res) => {
            // TODO: add correct seeds to pass test
            chai.should().not.exist(err)
            /*
             res.should.have.status(200)
             res.body.should.be.an('object')
             res.body.should.have.property('coachMark')
             res.body.coachMark.length.should.equal(2)
             */
            done()
          })
      })
    })

  describe('GET /api/v1/company/:companyId/scenario/:scenarioId/practice',
    () => {
      it('should get practices list for coach', (done) => {
        chai.request(server)
          .get('/api/v1/company/' + company +
            '/scenario/574e3a50616165b0b8b55555/practice')
          .set('Authorization', coach.accessToken)
          .end((err, res) => {
            chai.should().not.exist(err)
            res.should.have.status(200)
            res.body.length.should.to.be.equal(2)
            chai.expect(res.body).to.be.an('array')
            done()
          })
      })
      it('should get practices list for user', (done) => {
        chai.request(server)
          .get('/api/v1/company/' + company +
            '/scenario/574e3a50616165b0b8b55555/practice')
          .set('Authorization', companyUser.accessToken)
          .end((err, res) => {
            chai.should().not.exist(err)
            res.should.have.status(200)
            res.body.length.should.to.be.equal(1)
            chai.expect(res.body).to.be.an('array')
            done()
          })
      })
      it('should not list scenario for the company if not company user',
        (done) => {
          chai.request(server)
            .get('/api/v1/company/' + company +
              '/scenario/574e3a50616165b0b8b55555/practice')
            .set('Authorization', notCompanyUser.accessToken)
            .end((err, res) => {
              chai.should().exist(err)
              res.should.have.status(403)
              done()
            })
        })
    })
})
