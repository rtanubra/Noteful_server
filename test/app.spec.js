const { expect } = require('chai') //not needed because we configure testing
const supertest = require('supertest') //not needed because we configure testing
const app = require('../src/app')

describe('App', () => {
  it('GET / responds with 200 containing "Hello, world!"', () => {
    return supertest(app)
      .get('/')
      .expect(200, 'Hello, world!')
  })
})