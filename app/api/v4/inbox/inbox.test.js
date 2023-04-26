'use strict'

const server = require('../../../index')
const chai = require('chai')
const chaiHttp = require('chai-http')
const mocha = require('mocha')

chai.should()
chai.use(chaiHttp)

describe('INBOX API v4', () => {
  describe('POST /api/v4/company/:companyId/inbox', () => {
    let cAdmin
    mocha.before((done) => {
      chai.request(server).put('/api/v4/auth').send({
        email: 'john.doe@awesome.com',
        password: 'Qwerty0123',
        webForm: true
      }).end((err, res) => {
        chai.should().not.exist(err)
        res.body.should.have.property('accessToken')
        cAdmin = res.body
        done()
      })
    })

    it('should create inbox on /api/v4/inbox POST', (done) => {
      const data = {
        _recipient: '57fe2450916165b0b8b20444'
      }
      chai.request(server)
        .post('/api/v4/company/57fe2450916165b0b8b20aaa/inbox')
        .set('Authorization', cAdmin.accessToken)
        .send(data)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.should.have.property('inboxId')
          res.body._recipient._id.should.be.equal(data._recipient)
          done()
        })
    })
    it('should NOT create inbox if _recipient is invalid', (done) => {
      const data = {
        _recipient: '        '
      }
      chai.request(server)
        .post('/api/v4/company/57fe2450916165b0b8b20aaa/inbox')
        .set('Authorization', cAdmin.accessToken)
        .send(data)
        .end((err, res) => {
          chai.should().exist(err)
          res.should.have.status(400)
          res.body.should.be.an('object')
          res.body.should.have.property('error')
          res.body.error.should.be.equal('BAD_REQUEST')
          done()
        })
    })
  })
  describe('PATCH /api/v4/company/:companyId/inbox/:inboxId', () => {
    let cAdmin
    mocha.before((done) => {
      chai.request(server).put('/api/v4/auth').send({
        email: 'john.doe@awesome.com',
        password: 'Qwerty0123',
        webForm: true
      }).end((err, res) => {
        chai.should().not.exist(err)
        res.body.should.have.property('accessToken')
        cAdmin = res.body
        done()
      })
    })

    it('should update inbox on /api/v4/company/:companyId/inbox/:inboxId PATCH', (done) => {
      const data = {
        status: 'read'
      }
      chai.request(server)
        .patch('/api/v4/company/57fe2450916165b0b8b20aaa/inbox/595f7e3f3f4f98de237119e6')
        .set('Authorization', cAdmin.accessToken)
        .send(data)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.should.have.property('inboxId')
          res.body.status.should.be.equal(data.status)
          done()
        })
    })
    it('should NOT update inbox if status is invalid', (done) => {
      const data = {
        status: '        '
      }
      chai.request(server)
        .post('/api/v4/company/57fe2450916165b0b8b20aaa/inbox/595f7e3f3f4f98de237119e6')
        .set('Authorization', cAdmin.accessToken)
        .send(data)
        .end((err, res) => {
          chai.should().exist(err)
          res.should.have.status(400)
          res.body.should.be.an('object')
          res.body.should.have.property('error')
          res.body.error.should.be.equal('BAD_REQUEST')
          done()
        })
    })
  })
  describe('DELETE /api/v4/company/:companyId/inbox/:inboxId', () => {
    let cAdmin
    mocha.before((done) => {
      chai.request(server).put('/api/v4/auth').send({
        email: 'john.doe@awesome.com',
        password: 'Qwerty0123',
        webForm: true
      }).end((err, res) => {
        chai.should().not.exist(err)
        res.body.should.have.property('accessToken')
        cAdmin = res.body
        done()
      })
    })

    it('should delete inbox on /api/v4/company/:companyId/inbox/:inboxId PATCH', (done) => {
      chai.request(server)
        .delete('/api/v4/company/57fe2450916165b0b8b20aaa/inbox/595f7e3f3f4f98de237119e7')
        .set('Authorization', cAdmin.accessToken)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(204)
          done()
        })
    })
  })
  describe('PATCH /api/v4/company/:companyId/inbox bulkDelete', () => {
    let cAdmin
    mocha.before((done) => {
      chai.request(server).put('/api/v4/auth').send({
        email: 'john.doe@awesome.com',
        password: 'Qwerty0123',
        webForm: true
      }).end((err, res) => {
        chai.should().not.exist(err)
        res.body.should.have.property('accessToken')
        cAdmin = res.body
        done()
      })
    })

    it('should delete inboxes on /api/v4/company/:companyId/inbox PATCH', (done) => {
      const data = [
        {_id: '595f7e3f3f4f98de237119e8', isActive: false}
      ]
      chai.request(server)
        .patch('/api/v4/company/57fe2450916165b0b8b20aaa/inbox')
        .set('Authorization', cAdmin.accessToken)
        .send(data)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(204)
          done()
        })
    })
    it('should NOT delete inboxes if request is invalid', (done) => {
      const data = {
        status: '        '
      }
      chai.request(server)
        .patch('/api/v4/company/57fe2450916165b0b8b20aaa/inbox')
        .set('Authorization', cAdmin.accessToken)
        .send(data)
        .end((err, res) => {
          chai.should().exist(err)
          res.should.have.status(400)
          res.body.should.be.an('object')
          res.body.should.have.property('error')
          res.body.error.should.be.equal('BAD_REQUEST')
          done()
        })
    })
  })
})
