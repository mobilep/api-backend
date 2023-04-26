'use strict'

const server = require('../../../index')
const chai = require('chai')
const chaiHttp = require('chai-http')
const mocha = require('mocha')

chai.should()
chai.use(chaiHttp)

describe('CRITERIA API v1', () => {
  let companyUser, notCompanyUser
  const company = '57fe2450916165b0b8b20111'
  const criteria1 = '574e3a50616165b0b8b20111'
  mocha.before((done) => {
    chai.request(server).put('/api/v1/auth').send({
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
  describe('POST /api/v1/company/:companyId/criteria', () => {
    it('should create criteria for the company', (done) => {
      const data = {
        name: 'Test criteria',
        info: 'Test criteria info'
      }

      chai.request(server)
        .post('/api/v1/company/' + company + '/criteria')
        .set('Authorization', companyUser.accessToken)
        .send(data)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.should.have.property('name')
          res.body.name.should.be.equal(data.name)
          res.body.info.should.be.equal(data.info)
          done()
        })
    })
    it('should not create criteria for the company if not company user',
      (done) => {
        const data = {
          name: 'Test criteria',
          info: 'Test criteria info'
        }

        chai.request(server)
          .post('/api/v1/company/' + company + '/criteria')
          .set('Authorization', notCompanyUser.accessToken)
          .send(data)
          .end((err, res) => {
            chai.should().exist(err)
            res.should.have.status(403)
            done()
          })
      })
    it('should not create criteria for the company if such name already exists',
      (done) => {
        const data = {
          name: 'Existing criteria',
          info: 'Test criteria info'
        }

        chai.request(server)
          .post('/api/v1/company/' + company + '/criteria')
          .set('Authorization', companyUser.accessToken)
          .send(data)
          .end((err, res) => {
            chai.should().exist(err)
            res.should.have.status(400)
            done()
          })
      })
  })

  describe('PATCH /api/v1/company/:companyId/criteria/:criteriaId', () => {
    it('should edit criteria for the company', (done) => {
      const data = {
        name: 'Test criteria change',
        info: 'Test criteria info change'
      }

      chai.request(server)
        .patch('/api/v1/company/' + company + '/criteria/' + criteria1)
        .set('Authorization', companyUser.accessToken)
        .send(data)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.should.have.property('name')
          res.body.name.should.be.equal(data.name)
          res.body.info.should.be.equal(data.info)
          done()
        })
    })
    it('should not edit criteria for the company to existsing name', (done) => {
      const data = {
        name: 'Existing criteria',
        info: 'Test criteria info change'
      }

      chai.request(server)
        .patch('/api/v1/company/' + company + '/criteria/' + criteria1)
        .set('Authorization', companyUser.accessToken)
        .send(data)
        .end((err, res) => {
          chai.should().exist(err)
          res.should.have.status(400)
          done()
        })
    })
    it('should not edit criteria for the company if not company user',
      (done) => {
        const data = {
          name: 'Test criteria update 2',
          info: 'Test criteria info 222'
        }

        chai.request(server)
          .patch('/api/v1/company/' + company + '/criteria/' + criteria1)
          .set('Authorization', notCompanyUser.accessToken)
          .send(data)
          .end((err, res) => {
            chai.should().exist(err)
            res.should.have.status(403)
            done()
          })
      })
  })

  describe('GET /api/v1/company/:companyId/criteria', () => {
    it('should get criterias for the company', (done) => {
      chai.request(server)
        .get('/api/v1/company/' + company + '/criteria')
        .set('Authorization', companyUser.accessToken)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          res.body.should.be.an('array')
          res.body[0].should.have.property('name')
          done()
        })
    })
    it('should not get criterias for the company if not company user',
      (done) => {
        chai.request(server)
          .get('/api/v1/company/' + company + '/criteria')
          .set('Authorization', notCompanyUser.accessToken)
          .end((err, res) => {
            chai.should().exist(err)
            res.should.have.status(403)
            done()
          })
      })
  })

  describe('delete /api/v1/company/:companyId/criteria/:criteriaId', () => {
    it('should delete criteria for the company', (done) => {
      chai.request(server)
        .delete('/api/v1/company/' + company + '/criteria/' + criteria1)
        .set('Authorization', companyUser.accessToken)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          res.body.should.be.an('object')
          done()
        })
    })
    it('should not delete criteria for the company if not company user',
      (done) => {
        chai.request(server)
          .delete('/api/v1/company/' + company + '/criteria/' + criteria1)
          .set('Authorization', notCompanyUser.accessToken)
          .end((err, res) => {
            chai.should().exist(err)
            res.should.have.status(403)
            done()
          })
      })
  })
})
