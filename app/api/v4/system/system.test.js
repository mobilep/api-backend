'use strict'

const server = require('../../../index')
const chai = require('chai')
const chaiHttp = require('chai-http')
const mocha = require('mocha')

chai.should()
chai.use(chaiHttp)

describe('SYSTEM API v4', () => {
  describe('GET /api/v4/system/aws', () => {
    let user
    mocha.before((done) => {
      chai.request(server).put('/api/v4/auth').send({
        email: 'john.doe1@awesome.com',
        password: 'Qwerty0123'
      }).end((err, res) => {
        chai.should().not.exist(err)
        res.body.should.have.property('accessToken')
        user = res.body
        done()
      })
    })

    it('should get aws system info', (done) => {
      chai.request(server)
        .get('/api/v4/system/aws')
        .set('Authorization', user.accessToken)
        .send()
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.should.have.property('region')
          res.body.should.have.property('photoBucketAvarars')
          res.body.should.have.property('photoBucketInbox')
          res.body.should.have.property('videoBucket')
          res.body.should.have.property('fileBucket')
          res.body.should.have.property('audioBucket')
          done()
        })
    })
  })
})
