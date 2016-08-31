const chai = require('chai')
const chaiHttp = require('chai-http')
const passport = require("passport")
const User = require('../models/user-model')
const Clip = require('../models/clip-model')

const mongoose = require('mongoose')
const server = require('../server.js')


const should = chai.should()
const app = server.app

chai.use(chaiHttp)

describe('Index page', () => {
    it('exists', done => {
        chai.request(app)
            .get('/')
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.html
                done()
            })
    })
})

describe('Authentication', () => {

    before(done => {
        mongoose.connect('mongodb://localhost/top-clips-dev');

        // Allows the middleware to think we're already authenticated.
        app.request.isAuthenticated = () => {
            return true
        }
        done()
    })

    after(done => {
        app.request.isAuthenticated = () => {
            return false
        }
        mongoose.connection.close()
        done()
    })
    beforeEach(done => {
        app.request.user = {
            twitchId: 1,
            username: "one",
            clips: []
        }
        done()
    });

    afterEach(done => {
        done()
    });

    it('should allow access to account endpoint when logged in', done => {
        chai.request(app)
            .get('/account')
            .end((err, res) => {
                res.should.have.status(200)
                done()
            })
    })
    it('should allow access to myclips endpoint', done => {
        chai.request(app)
            .get('/myclips')
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.a('array')
                done()
            })
    })
    it('should logout and redirect to homepage', done => {
        chai.request(app)
            .get('/logout')
            .end((err, res) => {
                res.should.be.html
                done()
            })
    })
})

describe('Not authenticated', () => {
    it('should not allow access to account endpoint', done => {
        chai.request(app)
            .get('/account')
            .end((err, res) => {
                res.should.have.status(401)
                done()
            })
    })
})

describe('Clips', () => {
    before(done => {
        mongoose.connect('mongodb://localhost/top-clips-dev');
        done()
    })

    after(done => {
        mongoose.connection.close()
        done()
    })
    beforeEach(done => {
        Clip.remove({}, err => {
            done()
        })
    })

    it('should scrape data from url and create a clip object', done => {
        let clip = {title: 'test', link: 'https://clips.twitch.tv/dota2ti/SmilingCaribouTwitchRaid'}
        chai.request(app)
            .post('/scrape')
            .send(clip)
            .end((err, res) => {
                res.should.have.status(201)
                res.body.should.be.a('object')
                res.body.should.have.property('title')
                res.body.should.have.property('img')
                res.body.should.have.property('author')
                res.body.should.have.property('game')
                res.body.should.have.property('date')
                res.body.should.have.property('link')
                res.body.should.have.property('twitchId')
                res.body.should.have.property('_id')
                done()
            })
    })
})
