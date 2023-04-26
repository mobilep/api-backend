'use strict'

// const server = require('../../../index')
const chai = require('chai')
const expect = chai.expect
const chaiHttp = require('chai-http')
const helperUpload = require('./upload.helper')
// const {readFileSync} = require('fs')
// const path = require('path')

chai.should()
chai.use(chaiHttp)

describe('UPLOAD API v1', () => {
  // const meUser = {
  //   accessToken: utils.Passport.createAuthToken({
  //     _id: '57fe2450916165b0b8b2f111'
  //   })
  // }

  it('Generate fileId should return the same value', () => {
    helperUpload.generateFileId('efe88053-151f-46d4-a2ec-72c33a71b99e').should.be.equal('efe88053-151f-46d4-a2ec-72c33a71b99e')
  })

  it('Generate fileId should return string', () => {
    /* eslint no-unused-expressions: */
    helperUpload.generateFileId().should.not.empty
  })

  it('validateFileId should fail', () => {
    try {
      helperUpload.validateFileId('fail')
      expect(true).to.be.equal(false)
    } catch (error) {
      error.message.should.not.empty
      expect(error.message).to.be.equal('"fileID" must be a valid GUID; ')
    }
  })

  it('validateFileId should return the same value', () => {
    const fileId = helperUpload.generateFileId()
    helperUpload.validateFileId(fileId).should.be.equal(fileId)
  })

  it('isVideo should return null', () => {
    expect(helperUpload.isVideo('sample.jpg')).to.be.null
  })

  it('isVideo should success', () => {
    expect(helperUpload.isVideo('sample.mp4')).to.be.an('array')
    expect(helperUpload.isVideo('sample.mp4').length).to.be.gt(0)
  })

  it('isPhoto should return null', () => {
    expect(helperUpload.isPhoto('sample.mp4')).to.be.null
  })

  it('isPhoto should success', () => {
    expect(helperUpload.isPhoto('sample.jpg')).to.be.an('array')
    expect(helperUpload.isPhoto('sample.png').length).to.be.gt(0)
  })

  it('getBucked should fail', () => {
    try {
      helperUpload.getBucked('sample.odb')
      expect(true).to.be.equal(false)
    } catch (error) {
      error.message.should.not.empty
      expect(error.message).to.be.equal('Unexpected file format')
    }
  })

  it('getBucked should return string', () => {
    helperUpload.getBucked('sample.png').should.not.empty
  })

  it('getBucked should return different value for video and photo', () => {
    expect(helperUpload.getBucked('sample.jpg')).to.not.be.equal(helperUpload.getBucked('sample.mp4'))
  })

  // it('should fail on uploading sing file with fileID', (done) => {
  //   /* eslint handle-callback-err: */
  //   chai.request(server)
  //     .post('/api/v1/upload/')
  //     .field('fileID', 'customValue')
  //     .attach('file', readFileSync(path.resolve(__dirname, 'test.jpg')), 'test.jpg')
  //     .end((err, res) => {
  //       res.should.have.status(400)
  //       res.body.should.have.property('code')
  //       expect(res.body.code).to.be.equal(400)
  //       res.body.should.have.property('message')
  //       expect(res.body.message).to.be.equal('"fileID" must be a valid GUID; ')
  //       done()
  //     })
  // })

  // it('should upload sing file with fileID', (done) => {
  //   chai.request(server)
  //     .post('/api/v1/upload/')
  //     .field('fileID', 'efe88053-151f-46d4-a2ec-72c33a71b99e')
  //     .attach('file', readFileSync(path.resolve(__dirname, 'test.jpg')), 'test.jpg')
  //     .end((err, res) => {
  //       chai.should().not.exist(err)
  //       res.should.have.status(200)
  //       res.body.should.have.property('fileID')
  //       expect(res.body.fileID).to.be.equal('efe88053-151f-46d4-a2ec-72c33a71b99e')
  //       done()
  //     })
  // })

  // it('should upload sing file without fileID', (done) => {
  //   chai.request(server)
  //     .post('/api/v1/upload/')
  //     .attach('file', readFileSync(path.resolve(__dirname, 'test.jpg')), 'test.jpg')
  //     .end((err, res) => {
  //       chai.should().not.exist(err)
  //       res.should.have.status(200)
  //       res.body.should.have.property('fileID')
  //       done()
  //     })
  // })

  // it('should upload multyple files', (done) => {
  //   chai.request(server)
  //     .post('/api/v1/multyupload/')
  //     .attach('file1', readFileSync(path.resolve(__dirname, 'test.jpg')), 'test.jpg')
  //     .attach('file2', readFileSync(path.resolve(__dirname, 'test.jpg')), 'test.jpg')
  //     .end((err, res) => {
  //       chai.should().not.exist(err)
  //       res.should.have.status(200)
  //       res.body.should.have.property('files')
  //       expect(res.body.files).to.be.an('array')
  //       expect(res.body.files.length).to.be.equal(2)
  //       expect(res.body.files[0]).to.have.property('fileID')
  //       done()
  //     })
  // })
})
