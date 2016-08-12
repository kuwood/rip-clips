const chai = require('chai')
const chaiHttp = require('chai-http')

const server = require('../server.js')

const should = chai.should()
const app = server.app

chai.use(chaiHttp)

describe('Index page', () => {
    it('exists', (done) => {
        chai.request(app)
            .get('/')
            .end((err,res) => {
                res.should.have.status(200)
                res.should.be.html
                done()
            })
    })
})
