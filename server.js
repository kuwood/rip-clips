const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const User = require('./models/user-model')
const Clip = require('./models/clip-model')
const passport = require("passport")
const cookieParser = require("cookie-parser")
const cookieSession = require("cookie-session")
const request = require("request")
const cheerio = require("cheerio")

const dbConfig = require('./dbConfig')

const app = express()
const jsonParser = bodyParser.json()
const Strategy = require("passport-twitch").Strategy
let authConfig;
//check env to determine twitch oauth source
if (!process.env.clientID) {
     authConfig = require('./oauth')
}


app.config = dbConfig
app.use(cookieParser());
app.use(cookieSession({
    secret: "somesecrettokenhere"
}));

// parse application/x-www-form-urlencoded
//app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())

app.use(passport.initialize())
app.use(passport.session())

app.use(express.static('public'))

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

passport.use(new Strategy({
        name: 'twitch',
        clientID: process.env.clientID || authConfig.twitch.clientID,
        clientSecret: process.env.clientSecret || authConfig.twitch.clientSecret,
        callbackURL: process.env.callbackURL || authConfig.twitch.callbackURL,
        scope: "user_read"
    },
    function(accessToken, refreshToken, profile, done) {
        User.findOne({
            twitchId: profile.id
        }, function(err, user) {
            console.log(err, user);
            if (user) {
                return done(err, user);
            } else {
                user = new User({
                    twitchId: profile.id,
                    username: profile.username,
                    clips: []
                })
                user.save(function(err, user) {
                    console.log(err, user);
                    done(err, user)
                })
            }
        });

    }
));

app.get("/clips", function(req, res) {
    Clip.find({}).sort('date').exec((err, clips) => {
        if (err) {
            return res.status(500).json({
                message: 'Internal Server Error'
            })
        }
        res.status(200).json(clips)
    })
})

app.get("/search", (req, res) => {
    Clip.find({
        title: req.query.q
    },(err, clips) => {
        if (err) {
            return res.status(500).json({
                message: 'Internal Server Error'
            })
        }
        res.status(200).json(clips)
    })


})

app.get("/auth/twitch", passport.authenticate('twitch'),
    function(req, res) {
        // Request will be redirected to Twitch.tv for authentication, so this
        // function will not be called.
    }
);


app.get("/auth/twitch/callback", passport.authenticate("twitch", {
    failureRedirect: "/"
}), function(req, res) {

    res.cookie("user")
    res.redirect('/logged_in.html')
});

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/')
});

app.get("/account", ensureAuthenticated, function(req, res) {
    res.status(200).json(req.user)
})

app.get("/myclips", ensureAuthenticated, function(req, res) {
    Clip.find({
        twitchId: req.user.twitchId
    }, function(err, clips) {
        res.status(200).json(clips)
    });
})

app.post("/scrape", ensureAuthenticated, function(req, res) {
    url = req.body.link
    request(url, function(error, response, html) {
        if (!error) {
            let $ = cheerio.load(html)

            let userClip = new Clip();
            userClip.title = req.body.title
            userClip.img = $('.clip').attr('poster')
            userClip.author = $('.curator-link').text()
            userClip.game = $('.broadcaster-info__game-link').text()
            userClip.date = new Date()
            userClip.link = req.body.link
            userClip.twitchId = req.user.twitchId
            if (userClip.author || userClip.game) {
                userClip.save()
                res.status(201).json(userClip)
            } else {
                res.sendStatus(400)
            }

        } else {
            console.log(error);
            res.status(500).json(error)
        }
    })
})

app.delete('/clips/:id', ensureAuthenticated, (req, res) => {
    Clip.findOneAndRemove({
        _id: req.params.id,
        twitchId: req.user.twitchId
    }, (err, clip) => {
            if (err) {
                return res.status(404).json({
                    message: "Did not find that id"
                })
            }
            res.sendStatus(204)
        })
})

// test authentication middleware
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.sendStatus(401);
}

const runServer = callback => {
    mongoose.connect(dbConfig.DATABASE_URL, err => {
        if (err && callback) {
            return callback(err)
        }

        app.listen(dbConfig.PORT, () => {
            console.log('Listening on localhost:' + dbConfig.PORT);
            if (callback) {
                callback()
            }
        })
    })
}

if (require.main === module) {
    runServer(err => {
        if (err) {
            console.error(err)
        }
    })
}

exports.app = app
exports.runServer = runServer
