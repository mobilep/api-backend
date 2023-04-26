'use strict'

const server = require('../../../index')
const chai = require('chai')
const chaiHttp = require('chai-http')
const mocha = require('mocha')

chai.should()
chai.use(chaiHttp)

describe('COMPANY API v1', () => {
  describe('POST /api/v1/company', () => {
    let sysAdmin
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

    it('should create company on /api/v1/company POST', (done) => {
      const data = {
        name: 'Test1',
        info: 'it company'
      }

      chai.request(server)
        .post('/api/v1/company')
        .set('Authorization', sysAdmin.accessToken)
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

    it('should create company on /api/v1/company POST (diacritic)', (done) => {
      const data = {
        name: 'āā ȯ& 0-9 _ & - .',
        info: 'it company'
      }
      chai.request(server)
        .post('/api/v1/company')
        .set('Authorization', sysAdmin.accessToken)
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

    it('should not create company on /api/v1/company POST (diacritic)',
      (done) => {
        const data = {
          name: 'āā ȯ(',
          info: 'it company'
        }
        chai.request(server)
          .post('/api/v1/company')
          .set('Authorization', sysAdmin.accessToken)
          .send(data)
          .end((err, res) => {
            chai.should().exist(err)
            res.should.have.status(400)
            res.body.should.be.an('object')
            done()
          })
      })

    it('should NOT create company if Name already exists', (done) => {
      const data = {
        name: 'Techmagic '
      }

      chai.request(server)
        .post('/api/v1/company')
        .set('Authorization', sysAdmin.accessToken)
        .send(data)
        .end((err, res) => {
          chai.should().exist(err)
          res.should.have.status(400)
          done()
        })
    })

    it('should NOT create company if Name is invalid', (done) => {
      const data = {
        name: '        '
      }
      chai.request(server)
        .post('/api/v1/company')
        .set('Authorization', sysAdmin.accessToken)
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

  describe('POST /api/v1/company/:companyId/user', () => {
    const company1 = '57fe2450916165b0b8b20aaa'
    const company2 = '57fe2450916165b0b8b20bbb'
    let companyAdmin, sysAdmin
    const notAdmin = {
      accessToken: utils.Passport.createAuthToken({
        _id: '57fe2450916165b0b8b20333'
      })
    }
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

    it('should invite user(s) to company if company admin', (done) => {
      const data = [
        {
          firstName: 'Test',
          lastName: 'Test',
          email: 'test2@techmagic.co',
          country: 'france',
          lang: 'fr',
          postcode: '12345',
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
            }]
        }
      ]

      chai.request(server)
        .post('/api/v1/company/' + company1 + '/user')
        .set('Authorization', companyAdmin.accessToken)
        .send(data)
        .end((err, res) => {
          console.log(res)
          chai.should().not.exist(err)
          res.should.have.status(200)
          res.body.should.be.an('array')
          chai.expect(res.body).to.have.lengthOf(1)

          res.body[0].isCompanyAdmin.should.be.equal(false)
          res.body[0].firstName.should.be.equal(data[0].firstName)
          res.body[0].lastName.should.be.equal(data[0].lastName)
          res.body[0].email.should.be.equal(data[0].email)
          res.body[0].country.should.be.equal(data[0].country)
          res.body[0].lang.should.be.equal(data[0].lang)
          res.body[0].postcode.should.be.equal(data[0].postcode)
          res.body[0].extraInformation.should.be.deep.equal(
            data[0].extraInformation)
          res.body[0]._company._id.should.be.equal(company1)
          chai.should().not.exist(res.body[0].password)
          done()
        })
    })
    it('should invite user(s) to company if company admin (diacritic)',
      (done) => {
        const data = [
          {
            firstName: 'āā ȯ _ -. ` \'',
            lastName: 'Test',
            email: 'test2+2@techmagic.co',
            country: 'france',
            lang: 'fr',
            postcode: '12345',
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
              }]
          }
        ]

        chai.request(server)
          .post('/api/v1/company/' + company1 + '/user')
          .set('Authorization', companyAdmin.accessToken)
          .send(data)
          .end((err, res) => {
            chai.should().not.exist(err)
            res.should.have.status(200)
            res.body.should.be.an('array')
            chai.expect(res.body).to.have.lengthOf(1)

            res.body[0].isCompanyAdmin.should.be.equal(false)
            res.body[0].firstName.should.be.equal(data[0].firstName)
            res.body[0].lastName.should.be.equal(data[0].lastName)
            res.body[0].email.should.be.equal(data[0].email)
            res.body[0].country.should.be.equal(data[0].country)
            res.body[0].lang.should.be.equal(data[0].lang)
            res.body[0].postcode.should.be.equal(data[0].postcode)
            res.body[0].extraInformation.should.be.deep.equal(
              data[0].extraInformation)
            res.body[0]._company._id.should.be.equal(company1)
            chai.should().not.exist(res.body[0].password)
            done()
          })
      })
    it('should not invite user(s) to company if company admin (diacritic)',
      (done) => {
        const data = [
          {
            firstName: '@#$%^&*(()))',
            lastName: 'Test',
            email: 'test2+1@techmagic.co',
            country: 'france',
            lang: 'french',
            postcode: '12345',
            extraInformation: [
              {
                title: 'title',
                description: 'something about user'
              }]
          }
        ]

        chai.request(server)
          .post('/api/v1/company/' + company1 + '/user')
          .set('Authorization', companyAdmin.accessToken)
          .send(data)
          .end((err, res) => {
            chai.should().exist(err)
            res.should.have.status(400)
            done()
          })
      })
    it('should invite user(s) to company if sys admin', (done) => {
      const data = [
        {
          firstName: 'Test',
          lastName: 'Test',
          email: 'test3@techmagic.co',
          country: 'France',
          postcode: 'FR1121',
          lang: 'fr'
        }
      ]

      chai.request(server)
        .post('/api/v1/company/' + company2 + '/user')
        .set('Authorization', sysAdmin.accessToken)
        .send(data)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          res.body.should.be.an('array')
          chai.expect(res.body).to.have.lengthOf(1)

          res.body[0].isCompanyAdmin.should.be.equal(false)
          done()
        })
    })
    it('should invite company admin to company if sys admin', (done) => {
      const data = [
        {
          firstName: 'Mike',
          lastName: 'King',
          email: 'mikeadmin@techmagic.co',
          password: 'Qwerty123',
          isCompanyAdmin: true,
          country: 'France',
          postcode: 'FR1121',
          lang: 'fr'
        }
      ]

      chai.request(server)
        .post('/api/v1/company/' + company2 + '/user')
        .set('Authorization', sysAdmin.accessToken)
        .send(data)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          res.body.should.be.an('array')
          chai.expect(res.body).to.have.lengthOf(1)

          res.body[0].isCompanyAdmin.should.be.equal(true)
          done()
        })
    })
    it('should NOT invite user to company with password', (done) => {
      const data = [
        {
          firstName: 'Test',
          lastName: 'Test',
          email: 'invite1@techmagic.co',
          country: 'france',
          lang: 'french',
          postcode: '12345',
          extraInformation: [],
          password: 'Qwerty0123'
        }
      ]

      chai.request(server)
        .post('/api/v1/company/' + company1 + '/user')
        .set('Authorization', companyAdmin.accessToken)
        .send(data)
        .end((err, res) => {
          chai.should().exist(err)
          res.should.have.status(400)
          done()
        })
    })
    it('should NOT invite companyAdmin to company without password', (done) => {
      const data = [
        {
          firstName: 'Tes',
          lastName: 'Test',
          email: 'invite1@techmagic.co',
          country: 'france',
          lang: 'french',
          postcode: '12345',
          extraInformation: [],
          isCompanyAdmin: true
        }
      ]

      chai.request(server)
        .post('/api/v1/company/' + company1 + '/user')
        .set('Authorization', companyAdmin.accessToken)
        .send(data)
        .end((err, res) => {
          chai.should().exist(err)
          res.should.have.status(400)
          done()
        })
    })

    it(
      'should NOT invite user to company if user with this email already exists',
      (done) => {
        const data = [
          {
            firstName: 'john',
            lastName: 'doe',
            email: 'john.doe1@awesome.com',
            country: 'france',
            lang: 'french',
            postcode: '12345',
            extraInformation: []
          }
        ]

        chai.request(server)
          .post('/api/v1/company/' + company1 + '/user')
          .set('Authorization', companyAdmin.accessToken)
          .send(data)
          .end((err, res) => {
            chai.should().exist(err)
            res.should.have.status(400)
            done()
          })
      })
    it('should not invite user(s) to company if not admin', (done) => {
      const data = [
        {
          firstName: 'Test',
          lastName: 'Test',
          email: 'test4@techmagic.co'
        }
      ]

      chai.request(server)
        .post('/api/v1/company/' + company2 + '/user')
        .set('Authorization', notAdmin.accessToken)
        .send(data)
        .end((err, res) => {
          chai.should().exist(err)
          res.should.have.status(403)
          done()
        })
    })
  })

  describe('GET /api/v1/company/:companyId', () => {
    const company1 = '57fe2450916165b0b8b20aaa'
    const company2 = '57fe2450916165b0b8b20bbb'
    let companyAdmin, sysAdmin
    const notAdmin = {
      accessToken: utils.Passport.createAuthToken({
        _id: '57fe2450916165b0b8b20333'
      })
    }
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

    it('should get company info if company admin', (done) => {
      chai.request(server)
        .get('/api/v1/company/' + company1)
        .set('Authorization', companyAdmin.accessToken)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          res.body.should.be.an('object')

          chai.should().exist(res.body.name)
          done()
        })
    })
    it('should get company info if sys admin', (done) => {
      chai.request(server)
        .get('/api/v1/company/' + company2)
        .set('Authorization', sysAdmin.accessToken)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          res.body.should.be.an('object')

          chai.should().exist(res.body.name)
          done()
        })
    })
    it('should not get company info if not company user', (done) => {
      chai.request(server)
        .get('/api/v1/company/' + company1)
        .set('Authorization', notAdmin.accessToken)
        .end((err, res) => {
          chai.should().exist(err)
          res.should.have.status(403)
          done()
        })
    })
  })

  describe('GET /api/v1/company', () => {
    let companyAdmin, sysAdmin
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
    it('should get get all companies if sys admin', (done) => {
      chai.request(server)
        .get('/api/v1/company')
        .set('Authorization', sysAdmin.accessToken)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          res.body.should.be.an('array')

          done()
        })
    })
    it('should NOT get all companies if company admin', (done) => {
      chai.request(server)
        .get('/api/v1/company')
        .set('Authorization', companyAdmin.accessToken)
        .end((err, res) => {
          chai.should().exist(err)
          res.should.have.status(403)

          done()
        })
    })
  })

  describe('POST /api/v1/company/:companyId/invite', () => {
    const company1 = '57fe2450916165b0b8b20aaa'
    let sysAdmin
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
    it('should send invite email to user(s) if they exists', (done) => {
      const data = [
        '57fe2450916165b0b8b20222', '57fe2450916165b0b8b20444'
      ]

      chai.request(server)
        .post('/api/v1/company/' + company1 + '/invite')
        .set('Authorization', sysAdmin.accessToken)
        .send(data)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          res.body.should.be.an('array')
          done()
        })
    })
    it('should return forbidden when invite users from other companies',
      (done) => {
        const data = [
          '57fe2450916165b0b8b20333', '57fe2450916165b0b8b20444'
        ]

        chai.request(server)
          .post('/api/v1/company/' + company1 + '/invite')
          .set('Authorization', sysAdmin.accessToken)
          .send(data)
          .end((err, res) => {
            chai.should().exist(err)
            res.should.have.status(403)
            done()
          })
      })
  })

  describe('PATCH /api/v1/company/:companyId', () => {
    const company = '57fe2450916165b0b8b20ccc'
    let companyAdmin
    const notAdmin = {
      accessToken: utils.Passport.createAuthToken({
        _id: '57fe2450916165b0b8b20333'
      })
    }
    mocha.before((done) => {
      chai.request(server).put('/api/v1/auth').send({
        email: 'cccadmin@awesome.com',
        password: 'Qwerty0123'
      }).end((err, res) => {
        chai.should().not.exist(err)
        res.body.should.have.property('accessToken')
        companyAdmin = res.body
        done()
      })
    })

    it('should change company info if company admin', (done) => {
      const data = {
        info: 'changed info'
      }
      chai.request(server)
        .patch('/api/v1/company/' + company)
        .set('Authorization', companyAdmin.accessToken)
        .send(data)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          res.body.should.be.an('object')

          chai.should().exist(res.body.name)
          chai.should().exist(res.body.info)
          res.body.info.should.be.equal(data.info)
          done()
        })
    })
    it('should change company name if company admin', (done) => {
      const data = {
        name: 'changed name'
      }
      chai.request(server)
        .patch('/api/v1/company/' + company)
        .set('Authorization', companyAdmin.accessToken)
        .send(data)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          res.body.should.be.an('object')

          chai.should().exist(res.body.name)
          chai.should().exist(res.body.info)
          res.body.name.should.be.equal(data.name)
          done()
        })
    })
    it('should change company name to the same name if company admin',
      (done) => {
        const data = {
          name: 'changed name'
        }
        chai.request(server)
          .patch('/api/v1/company/' + company)
          .set('Authorization', companyAdmin.accessToken)
          .send(data)
          .end((err, res) => {
            chai.should().not.exist(err)
            res.should.have.status(200)
            res.body.should.be.an('object')

            chai.should().exist(res.body.name)
            chai.should().exist(res.body.info)
            res.body.name.should.be.equal(data.name)
            done()
          })
      })
    it('should not change company if not company admin', (done) => {
      const data = {
        name: 'changed name'
      }
      chai.request(server)
        .patch('/api/v1/company/' + company)
        .set('Authorization', notAdmin.accessToken)
        .send(data)
        .end((err, res) => {
          chai.should().exist(err)
          res.should.have.status(403)
          done()
        })
    })
  })

  describe('DELETE /api/v1/company/:companyId', () => {
    const company = '57fe2450916165b0b8b20ddd'
    let sysAdmin, companyAdmin
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
        email: 'dddadmin@awesome.com',
        password: 'Qwerty0123'
      }).end((err, res) => {
        chai.should().not.exist(err)
        res.body.should.have.property('accessToken')
        companyAdmin = res.body
        done()
      })
    })
    it('should not delete company if not sys admin', (done) => {
      chai.request(server)
        .delete('/api/v1/company/' + company)
        .set('Authorization', companyAdmin.accessToken)
        .end((err, res) => {
          chai.should().exist(err)
          res.should.have.status(403)
          done()
        })
    })
    it('should delete company if sys admin', (done) => {
      chai.request(server)
        .delete('/api/v1/company/' + company)
        .set('Authorization', sysAdmin.accessToken)
        .end((err, res) => {
          chai.should().not.exist(err)
          res.should.have.status(200)
          res.body.should.be.an('object')
          res.body.isActive.should.be.equal(false)
          done()
        })
    })
  })
})
