/*jshint expr: true*/
global.DATABASE_URL = 'mongodb://localhost/top-clips-dev'
const chai = require('chai')
const chaiHttp = require('chai-http')
const passport = require("passport")
const User = require('../models/user-model')
const Clip = require('../models/clip-model')

const mongoose = require('mongoose')
const server = require('../server.js')

const expect = chai.expect
const should = chai.should()
const app = server.app

chai.use(chaiHttp)



describe('Index page', () => {
    it('exists', done => {
        chai.request(app)
            .get('/')
            .end((err, res) => {
                res.should.have.status(200)
                //alternative to res.should.be.html
                expect(res).to.have.header('content-type', 'text/html; charset=UTF-8')
                done()
            })
    })
})

describe('Authentication', () => {

    before(done => {
        server.runServer(()=> {
            app.request.isAuthenticated = () => {
                return true
            }
            done()
        })
        //server.runServer()
        //mongoose.connect('mongodb://localhost/top-clips-dev');

        // Allows the middleware to think we're already authenticated.
        //done()
    })

    after(done => {
        app.request.isAuthenticated = () => {
            return false
        }
        //mongoose.connection.close()
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
        app.request.user = {
            twitchId: 12345,
            username: "one",
            clips: []
        }
        app.request.isAuthenticated = () => {
            return true
        }
        done()
    })

    after(done => {
        app.request.isAuthenticated = () => {
            return false
        }
        done()
    })
    beforeEach(done => {
        let tempClip = new Clip ()
        tempClip.title = "I'MwINNINGett"
        tempClip.img = "https://clips-media-assets.twitch.tv/22763830688-index-0000003416-preview.jpg"
        tempClip.author = "Cool_guy_user"
        tempClip.date = new Date()
        tempClip.game = "Dota 2"
        tempClip.link = "https://clips.twitch.tv/dota2ti/SmilingCaribouTwitchRaid"
        tempClip.twitchId = "12345"
        tempClip.save((function(err, tempClip) {
            done(err, tempClip)
        }))
    })
    afterEach(done => {
        Clip.remove({}, err => {
            done()
        })
    })

    it('should scrape data from url and create a clip object', done => {
        let clip = {title: 'test', link: 'http://localhost' + ':' + app.config.PORT + '/test-page.html'}
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

    it('should remove object from database on delete', done => {
        let id;
        chai.request(app)
        .get('/clips')
        .end((err, res) => {
            res.body.should.have.length(1)
            id = res.body[0]._id
            chai.request(app)
                .delete('/clips/' + id)
                .send(id)
                .end((err, res) => {
                    res.should.have.status(204)
                    chai.request(app)
                    .get('/clips')
                    .end((err, res) => {
                        res.body.should.have.length(0)
                        done()
                    })
                })
        })
    })

    it('should return search results', done => {
        chai.request(app)
        .get('/search?q='+"I'MwINNINGett")
        .end((err, res) => {
            res.body[0].should.have.property('title')
            res.body[0].title.should.be.equal("I'MwINNINGett")
            done()
        })
    })
})
