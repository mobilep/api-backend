'use strict'

const server = require('../../../index')
const chai = require('chai')
const chaiHttp = require('chai-http')
const mocha = require('mocha')

chai.should()
chai.use(chaiHttp)

describe('TEMPLATE API v4', () => {
  let sysAdmin, companyUser, templateId
  const company = '57fe2450916165b0b8b20111'

  mocha.before((done) => {
    chai.request(server).put('/api/v4/auth').send({
      email: 'john.doe@awesome.com',
      password: 'Qwerty0123',
      webForm: true
    }).end((err, res) => {
      chai.should().not.exist(err)
      res.body.should.have.property('accessToken')
      sysAdmin = res.body
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
      companyUser = res.body
      done()
    })
  })

  describe('POST /api/v4/company/:companyId/template', () => {
    it('should create scenario template for the company', (done) => {
      const data = {
        name: 'test template',
        info: 'description'
      }

      chai.request(server)
        .post('/api/v4/company/' + company + '/template')
        .set('Authorization', sysAdmin.accessToken)
        .send(data)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.should.have.property('canEditVideo')
          res.body.should.have.property('logs')
          templateId = res.body._id
          done()
        })
    })
  })

  describe('PATCH /api/v4/company/:companyId/template/:templateId', () => {
    it('should update scenario template', (done) => {
      const data = {
        name: 'new name',
        info: 'new description'
      }

      chai.request(server)
        .patch('/api/v4/company/' + company + '/template/' + templateId)
        .set('Authorization', sysAdmin.accessToken)
        .send(data)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.name.should.be.equal(data.name)
          res.body.info.should.be.equal(data.info)
          done()
        })
    })
  })

  describe('POST /api/v4/company/:companyId/template/:templateId/assign', () => {
    it('should assign scenario template to coach', (done) => {
      const data = [companyUser._id]

      chai.request(server)
        .post('/api/v4/company/' + company + '/template/' + templateId + '/assign')
        .set('Authorization', sysAdmin.accessToken)
        .send(data)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(204)
          done()
        })
    })
  })

  describe('GET /api/v4/company/:companyId/template', () => {
    it('should get templates for company', (done) => {
      chai.request(server)
        .get('/api/v4/company/' + company + '/template')
        .set('Authorization', sysAdmin.accessToken)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          chai.expect(res.body).to.be.an('array')
          done()
        })
    })
  })

  describe('GET /api/v4/company/:companyId/template/:templateId', () => {
    it('should get one template', (done) => {
      chai.request(server)
        .get('/api/v4/company/' + company + '/template/' + templateId)
        .set('Authorization', sysAdmin.accessToken)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.logs.length.should.be.equal(1)
          done()
        })
    })
  })

  describe('PATCH /api/v4/company/:companyId/template', () => {
    it('should delete template(s)', (done) => {
      const body = [templateId]

      chai.request(server)
        .patch('/api/v4/company/' + company + '/template')
        .set('Authorization', sysAdmin.accessToken)
        .send(body)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(204)
          done()
        })
    })
  })
})
