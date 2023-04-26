'use strict'

const server = require('../../../index')
const chai = require('chai')
const chaiHttp = require('chai-http')
const mocha = require('mocha')

chai.should()
chai.use(chaiHttp)

describe('AUTH API v4', () => {
  describe('put /api/v4/auth', () => {
    it('user should be able to login with correct email and pass', (done) => {
      const data = {
        email: 'john.doe1@awesome.com',
        password: 'Qwerty0123'
      }
      chai.request(server).put('/api/v4/auth').send(data).end((err, res) => {
        chai.should().not.exist(err)
        res.should.have.status(200)
        res.body.should.have.property('accessToken')
        res.body.email.should.be.equal(data.email)
        done()
      })
    })

    it('user should be NOT able to login with wrong pass', (done) => {
      const data = {
        email: 'john.doe1@awesome.com',
        password: 'Qwerty0123-wrong'
      }
      chai.request(server).put('/api/v4/auth').send(data).end((err, res) => {
        chai.should().exist(err)
        res.should.have.status(400)
        done()
      })
    })
  })

  describe('post /api/v4/auth/forgot-password', () => {
    it('user should be able request forgot password', (done) => {
      const data = {
        email: 'john.doe1@awesome.com'
      }
      chai.request(server)
        .post('/api/v4/auth/forgot-password')
        .send(data)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          done()
        })
    })

    it('user should NOT be able request forgot password if not admin',
      (done) => {
        const data = {
          email: 'don@awesome.com'
        }
        chai.request(server)
          .post('/api/v4/auth/forgot-password')
          .send(data)
          .end((err, res) => {
            chai.should().exist(err)
            res.should.have.status(400)
            done()
          })
      })

    it('user should NOT be able request forgot password if iset not exists',
      (done) => {
        const data = {
          email: 'not-exists@awesome.com'
        }
        chai.request(server)
          .post('/api/v4/auth/forgot-password')
          .send(data)
          .end((err, res) => {
            chai.should().exist(err)
            res.should.have.status(400)
            done()
          })
      })
  })

  describe('post /api/v4/auth/new-password', () => {
    let companyAdmin
    mocha.before((done) => {
      chai.request(server).put('/api/v4/auth').send({
        email: 'king@awesome.com',
        password: 'Qwerty0123'
      }).end((err, res) => {
        chai.should().not.exist(err)
        res.body.should.have.property('accessToken')
        companyAdmin = res.body
        done()
      })
    })
    it('should return forbidden when resetToken is incorrect', (done) => {
      const resetPasswordToken = utils.Passport.createResetToken({
        _id: companyAdmin._id,
        password: utils.Passport.encryptPassword('Qwerty0123')
      })
      const data = {
        password: 'Qwerty123'
      }
      chai.request(server)
        .post('/api/v4/auth/new-password')
        .send(data)
        .set('Authorization', resetPasswordToken)
        .end((err, res) => {
          chai.should().exist(err)
          res.should.have.status(403)
          done()
        })
    })
  })

  describe('post /api/v4/auth/change-password', () => {
    let companyAdmin
    mocha.before((done) => {
      chai.request(server).put('/api/v4/auth').send({
        email: 'andrew@awesome.com',
        password: 'Qwerty123'
      }).end((err, res) => {
        chai.should().not.exist(err)
        res.body.should.have.property('accessToken')
        companyAdmin = res.body
        done()
      })
    })
    it('user should NOT be able to change password, if old password is wrong',
      (done) => {
        const data = {
          oldPassword: 'Qwerty0123-wrong-pass',
          newPassword: 'Qwerty0123-new'
        }
        chai.request(server)
          .post('/api/v4/auth/change-password')
          .send(data)
          .set('Authorization', companyAdmin.accessToken)
          .end((err, res) => {
            chai.should().exist(err)
            res.should.have.status(400)
            done()
          })
      })
    it('user should be able to change password', (done) => {
      const data = {
        oldPassword: 'Qwerty123',
        newPassword: 'Qwerty-new1'
      }
      chai.request(server)
        .post('/api/v4/auth/change-password')
        .send(data)
        .set('Authorization', companyAdmin.accessToken)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.body.email.should.be.equal(companyAdmin.email)
          res.should.have.status(200)
          done()
        })
    })
  })
})
