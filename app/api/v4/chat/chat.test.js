'use strict'

const server = require('../../../index')
const chai = require('chai')
const chaiHttp = require('chai-http')
const mocha = require('mocha')

chai.should()
chai.use(chaiHttp)

describe('MPCHAT API v4', () => {
  let companyUser, notCompanyUser
  const company = '57fe2450916165b0b8b20111'
  const chat = '5dd2c03584c168a3a8b0e000'

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

  describe('POST /api/v4/company/:companyId/chat', () => {
    it('should create private group chat', (done) => {
      const data = {
        'recipients': ['57fe2450916165b0b8b21112'],
        'title': 'test'
      }

      chai.request(server)
        .post('/api/v4/company/' + company + '/chat')
        .set('Authorization', companyUser.accessToken)
        .send(data)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body._moderator._id.should.be.equal(companyUser._id)
          res.body.users.length.should.be.equal(2)
          res.body.title.should.be.equal(data.title)
          done()
        })
    })

    it('should not create private group chat if user in not company user', (done) => {
      const data = {
        'recipients': ['57fe2450916165b0b8b21112']
      }

      chai.request(server)
        .post('/api/v4/company/' + company + '/chat')
        .set('Authorization', notCompanyUser.accessToken)
        .send(data)
        .end((err, res) => {
          chai.should().exist(err)
          res.should.have.status(403)
          done()
        })
    })
  })

  describe('GET /api/v4/company/:companyId/chat', () => {
    it('should get group chats for the company user', (done) => {
      chai.request(server)
        .get('/api/v4/company/' + company + '/chat')
        .set('Authorization', companyUser.accessToken)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          chai.expect(res.body).to.be.an('array')
          done()
        })
    })
    it('should not get group chats for not company user', (done) => {
      chai.request(server)
        .get('/api/v4/company/' + company + '/chat')
        .set('Authorization', notCompanyUser.accessToken)
        .end((err, res) => {
          chai.should().exist(err)
          res.should.have.status(403)
          done()
        })
    })
  })

  describe('GET /api/v4/company/:companyId/chat/:chatId', () => {
    it('should get one group chat for the company user', (done) => {
      chai.request(server)
        .get('/api/v4/company/' + company + '/chat/' + chat)
        .set('Authorization', companyUser.accessToken)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          chai.expect(res.body).to.be.an('object')
          res.body._moderator._id.should.be.equal(companyUser._id)
          done()
        })
    })
    it('schould not get the group chat for not company user', (done) => {
      chai.request(server)
        .get('/api/v4/company/' + company + '/chat/' + chat)
        .set('Authorization', notCompanyUser.accessToken)
        .end((err, res) => {
          chai.should().exist(err)
          res.should.have.status(403)
          done()
        })
    })
  })

  describe('PATCH /api/v4/company/:companyId/chat/:chatId', () => {
    it('should update chat', (done) => {
      const data = {
        status: 'read',
        lastReadMessage: '-message'
      }
      chai.request(server)
        .patch('/api/v4/company/' + company + '/chat/' + chat)
        .send(data)
        .set('Authorization', companyUser.accessToken)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          chai.expect(res.body).to.be.an('object')
          res.body._moderator._id.should.be.equal(companyUser._id)
          done()
        })
    })

    it('should not update chat', (done) => {
      const data = {
        status: 'badStatus',
        lastReadMessage: '-message'
      }
      chai.request(server)
        .patch('/api/v4/company/' + company + '/chat/' + chat)
        .send(data)
        .set('Authorization', companyUser.accessToken)
        .end((err, res) => {
          chai.should().exist(err)
          res.should.have.status(400)
          done()
        })
    })
  })
})
