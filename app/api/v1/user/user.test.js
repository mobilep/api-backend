'use strict'

const server = require('../../../index')
const chai = require('chai')
const chaiHttp = require('chai-http')
const mocha = require('mocha')

chai.should()
chai.use(chaiHttp)

describe('USER API v1', () => {
  describe('GET /api/v1/user', () => {
    let user
    mocha.before((done) => {
      chai.request(server).put('/api/v1/auth').send({
        email: 'john.doe1@awesome.com',
        password: 'Qwerty0123'
      }).end((err, res) => {
        chai.should().not.exist(err)
        res.body.should.have.property('accessToken')
        user = res.body
        done()
      })
    })

    it('should get current user info ', (done) => {
      chai.request(server)
        .get('/api/v1/user')
        .set('Authorization', user.accessToken)
        .send()
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.should.have.property('email')
          res.body.email.should.be.equal(user.email)
          done()
        })
    })
  })
  /*
  describe('POST /api/v1/sysadmin/4172C65B-E6AE-4C51-B0B1-92A313E63810', () => {
    const data = {
      'firstName': 'Mike',
      'lastName': 'King',
      'email': 'admin@techmagic.co',
      'password': 'Qwerty123',
      'country': 'France',
      'postcode': 'FR1121',
      'lang': 'fr'
    }

    it('should current sys admin', (done) => {
      chai.request(server)
        .post('/api/v1/sysadmin/4172C65B-E6AE-4C51-B0B1-92A313E63810')
        .send(data)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.email.should.be.equal(data.email)
          res.body.firstName.should.be.equal(data.firstName)
          res.body.lastName.should.be.equal(data.lastName)
          res.body.isSysAdmin.should.be.equal(true)
          done()
        })
    })
  })
  */

  describe('GET /api/v1/company/:companyId/user', () => {
    let sysAdmin, companyAdmin
    const company = '57fe2450916165b0b8b20aaa'
    mocha.before((done) => {
      chai.request(server).put('/api/v1/auth').send({
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
      chai.request(server).put('/api/v1/auth').send({
        email: 'john.doe1@awesome.com',
        password: 'Qwerty0123'
      }).end((err, res) => {
        chai.should().not.exist(err)
        res.body.should.have.property('accessToken')
        companyAdmin = res.body
        done()
      })
    })
    it('should get list of users per company if sys admin', (done) => {
      chai.request(server)
        .get('/api/v1/company/' + company + '/user')
        .set('Authorization', sysAdmin.accessToken)
        .send()
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          res.body.should.be.an('array')
          done()
        })
    })
    it('should get list of users per company if company admin', (done) => {
      chai.request(server)
        .get('/api/v1/company/' + company + '/user')
        .set('Authorization', companyAdmin.accessToken)
        .send()
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          res.body.should.be.an('array')
          done()
        })
    })
  })

  describe('POST /api/v1/user/device', () => {
    let companyAdmin
    mocha.before((done) => {
      chai.request(server).put('/api/v1/auth').send({
        email: 'john.doe1@awesome.com',
        password: 'Qwerty0123'
      }).end((err, res) => {
        chai.should().not.exist(err)
        res.body.should.have.property('accessToken')
        companyAdmin = res.body
        done()
      })
    })
    it('should register device', (done) => {
      chai.request(server)
        .post('/api/v1/user/device')
        .set('Authorization', companyAdmin.accessToken)
        .send({
          token: '3C5E7B1BC0F8D9BA42F4C110F63EA23E91B6F47C3ED3E80252D193A821F49FAA'
        })
        .end((err, res) => {
          console.log('err', res.body)
          chai.should().not.exist(err)
          res.should.have.status(204)
          done()
        })
    })
  })

  describe('DELETE /api/v1/user/device', () => {
    let companyAdmin
    mocha.before((done) => {
      chai.request(server).put('/api/v1/auth').send({
        email: 'john.doe1@awesome.com',
        password: 'Qwerty0123'
      }).end((err, res) => {
        chai.should().not.exist(err)
        res.body.should.have.property('accessToken')
        companyAdmin = res.body
        done()
      })
    })
    it('should get list of users per company if company admin', (done) => {
      chai.request(server)
        .delete('/api/v1/user/device/qq11')
        .set('Authorization', companyAdmin.accessToken)
        .send()
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(204)
          done()
        })
    })
  })

  describe('GET /api/v1/company/:companyId/user/:userId', () => {
    let inCompanyUser
    const notInCompanyUser = {
      accessToken: utils.Passport.createAuthToken({
        _id: '57fe2450916165b0b8b20888'
      })
    }
    const company = '57fe2450916165b0b8b20aaa'
    const user = '57fe2450916165b0b8b20777'
    mocha.before((done) => {
      chai.request(server).put('/api/v1/auth').send({
        email: 'ihor@awesome.com',
        password: 'Qwerty0123'
      }).end((err, res) => {
        chai.should().not.exist(err)
        res.body.should.have.property('accessToken')
        inCompanyUser = res.body
        done()
      })
    })

    it('should get user from the same company', (done) => {
      chai.request(server)
        .get('/api/v1/company/' + company + '/user/' + user)
        .set('Authorization', inCompanyUser.accessToken)
        .send()
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body._id.should.be.equal(user)
          done()
        })
    })
    it('should not get user from different company', (done) => {
      chai.request(server)
        .get('/api/v1/company/' + company + '/user/' + user)
        .set('Authorization', notInCompanyUser.accessToken)
        .send()
        .end((err, res) => {
          chai.should().exist(err)
          res.should.have.status(403)
          done()
        })
    })
  })

  describe('DELETE /api/v1/company/:companyId/user', () => {
    let sysAdmin, companyAdmin
    const justUser = {
      _id: '57fe2450916165b0b8b2f222',
      accessToken: utils.Passport.createAuthToken({
        _id: '57fe2450916165b0b8b2f222'
      })
    }
    const users = [
      {_id: '57fe2450916165b0b8b20778'},
      {_id: '57fe2450916165b0b8b20779'}]
    const company = '57fe2450916165b0b8b20aaa'
    mocha.before((done) => {
      chai.request(server).put('/api/v1/auth').send({
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
      chai.request(server).put('/api/v1/auth').send({
        email: 'andyadmin@awesome.com',
        password: 'Qwerty0123'
      }).end((err, res) => {
        chai.should().not.exist(err)
        res.body.should.have.property('accessToken')
        companyAdmin = res.body
        done()
      })
    })
    it('should delete user in company if sys admin', (done) => {
      chai.request(server)
        .patch('/api/v1/company/' + company + '/user')
        .set('Authorization', sysAdmin.accessToken)
        .send(users)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(204)
          done()
        })
    })
    it('should not be able to delete himself', (done) => {
      chai.request(server)
        .patch('/api/v1/company/' + company + '/user')
        .set('Authorization', companyAdmin.accessToken)
        .send([{_id: companyAdmin._id}])
        .end((err, res) => {
          chai.should().exist(err)
          res.should.have.status(403)
          done()
        })
    })
    it('should NOT delete user in company if not admin', (done) => {
      chai.request(server)
        .patch('/api/v1/company/' + company + '/user')
        .set('Authorization', justUser.accessToken)
        .send([users])
        .end((err, res) => {
          chai.should().exist(err)
          res.should.have.status(403)
          done()
        })
    })
  })

  describe('DELETE /api/v1/company/:companyId/user/:userId', () => {
    let sysAdmin, companyAdmin
    const user = '57fe2450916165b0b8b20777'
    const company = '57fe2450916165b0b8b20aaa'
    const justUser = {
      _id: '57fe2450916165b0b8b2f222',
      accessToken: utils.Passport.createAuthToken({
        _id: '57fe2450916165b0b8b2f222'
      })
    }
    mocha.before((done) => {
      chai.request(server).put('/api/v1/auth').send({
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
      chai.request(server).put('/api/v1/auth').send({
        email: 'andyadmin@awesome.com',
        password: 'Qwerty0123'
      }).end((err, res) => {
        chai.should().not.exist(err)
        res.body.should.have.property('accessToken')
        companyAdmin = res.body
        done()
      })
    })
    it('should delete user in company if sys admin', (done) => {
      chai.request(server)
        .delete('/api/v1/company/' + company + '/user/' + user)
        .set('Authorization', sysAdmin.accessToken)
        .send()
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(204)
          done()
        })
    })
    it('should not be able to delete himself', (done) => {
      chai.request(server)
        .delete('/api/v1/company/' + company + '/user/' + companyAdmin._id)
        .set('Authorization', companyAdmin.accessToken)
        .send()
        .end((err, res) => {
          chai.should().exist(err)
          res.should.have.status(403)
          done()
        })
    })
    it('should NOT delete user in company if not admin', (done) => {
      chai.request(server)
        .delete('/api/v1/company/' + company + '/user/' + user)
        .set('Authorization', justUser.accessToken)
        .send()
        .end((err, res) => {
          chai.should().exist(err)
          res.should.have.status(403)
          done()
        })
    })
  })

  describe('DELETE /api/v1/user/:userId', () => {
    let sysAdmin
    mocha.before((done) => {
      chai.request(server).put('/api/v1/auth').send({
        email: 'john.deleteuser@awesome.com',
        password: 'Qwerty0123',
        webForm: true
      }).end((err, res) => {
        chai.should().not.exist(err)
        res.body.should.have.property('accessToken')
        sysAdmin = res.body
        done()
      })
    })

    it('should not be able to delete another user', (done) => {
      chai.request(server)
        .delete('/api/v1/user/57fe2450916165b0b8b22222')
        .set('Authorization', sysAdmin.accessToken)
        .send()
        .end((err, res) => {
          chai.should().exist(err)
          res.should.have.status(403)
          done()
        })
    })

    it('should delete himself', (done) => {
      chai.request(server)
        .delete('/api/v1/user/57fe2450916165b0b8b21222')
        .set('Authorization', sysAdmin.accessToken)
        .send()
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(204)
          done()
        })
    })
  })

  describe('PATCH /api/v1/company/:companyId/user/:userId', () => {
    let sysAdmin
    const meUser = {
      accessToken: utils.Passport.createAuthToken({
        _id: '57fe2450916165b0b8b2f111'
      })
    }
    const otherUser = {
      _id: '57fe2450916165b0b8b2f222',
      accessToken: utils.Passport.createAuthToken({
        _id: '57fe2450916165b0b8b2f222'
      })
    }
    const user = '57fe2450916165b0b8b2f111'
    const company = '57fe2450916165b0b8b20fff'
    mocha.before((done) => {
      chai.request(server).put('/api/v1/auth').send({
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

    it('should edit user in company if sys admin', (done) => {
      const data = {
        firstName: 'Jhon',
        lastName: 'King',
        avatarId: '121212121',
        country: 'France',
        postcode: 'FR1121',
        lang: 'fr'
      }
      chai.request(server)
        .patch('/api/v1/company/' + company + '/user/' + user)
        .set('Authorization', sysAdmin.accessToken)
        .send(data)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.avatarId.should.be.equal(data.avatarId)
          res.body.firstName.should.be.equal(data.firstName)
          res.body.lastName.should.be.equal(data.lastName)
          res.body.should.have.property('avatar_sm')
          res.body.should.have.property('avatar_md')
          res.body.should.have.property('avatar_lg')
          done()
        })
    })
    it('should edit myself (only avatarId)', (done) => {
      const data = {
        avatarId: '12121212122222'
      }
      chai.request(server)
        .patch('/api/v1/company/' + company + '/user/' + user)
        .set('Authorization', meUser.accessToken)
        .send(data)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.avatarId.should.be.equal(data.avatarId)
          res.body.should.have.property('avatar_sm')
          res.body.should.have.property('avatar_md')
          res.body.should.have.property('avatar_lg')
          done()
        })
    })
    it('only admin can edit extraInformation', (done) => {
      const data = {
        firstName: 'Jhon',
        lastName: 'King',
        email: 'new@email.com',
        avatarId: '12121212122222',
        avatarColor: '000000',
        extraInformation: [
          {
            title: 'Business Unit',
            description: ''
          },
          {
            title: 'Region',
            description: ''
          },
          {
            title: 'Country Region',
            description: '👾 🤖 🎃 😺'
          },
          {
            title: 'Global Region',
            description: ''
          },
          {
            title: 'Custom 1',
            description: '画論人生認参用起球'
          },
          {
            title: 'Custom 2',
            description: 'dénen Blumn né'
          },
          {
            title: 'Custom 3',
            description: 'ā ḑ ~`@#$%^&*()_-+=/?><.,\''
          }
        ]
      }
      chai.request(server)
        .patch('/api/v1/company/' + company + '/user/' + user)
        .set('Authorization', sysAdmin.accessToken)
        .send(data)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.avatarId.should.be.equal(data.avatarId)
          res.body.firstName.should.be.equal(data.firstName)
          res.body.lastName.should.be.equal(data.lastName)
          res.body.avatarColor.should.be.equal('000000')
          res.body.extraInformation.should.to.deep.equal(data.extraInformation)
          res.body.should.have.property('avatar_sm')
          res.body.should.have.property('avatar_md')
          res.body.should.have.property('avatar_lg')
          done()
        })
    })
    it('should be error when not admin edit extraInformation', (done) => {
      const data = {
        firstName: 'Jhon',
        lastName: 'King',
        email: 'new@email.com',
        avatarId: '12121212122222',
        avatarColor: '000000',
        extraInformation: [
          {
            title: 'Business Unit',
            description: ''
          },
          {
            title: 'Region',
            description: ''
          },
          {
            title: 'Country Region',
            description: ''
          },
          {
            title: 'Global Region',
            description: ''
          },
          {
            title: 'Custom 1',
            description: ''
          },
          {
            title: 'Custom 2',
            description: ''
          },
          {
            title: 'Custom 3',
            description: ''
          }],
        country: 'France',
        postcode: 'FR1121',
        lang: 'French'
      }
      chai.request(server)
        .patch('/api/v1/company/' + company + '/user/' + user)
        .set('Authorization', meUser.accessToken)
        .send(data)
        .end((err, res) => {
          chai.should().exist(err)
          res.should.have.status(403)
          done()
        })
    })
    it('should not edit user by other user(not admin)', (done) => {
      const data = {
        firstName: 'Not changed',
        lastName: 'Not changed'
      }
      chai.request(server)
        .patch('/api/v1/company/' + company + '/user/' + user)
        .set('Authorization', otherUser.accessToken)
        .send(data)
        .end((err, res) => {
          chai.should().exist(err)
          res.should.have.status(403)
          done()
        })
    })
  })
})
