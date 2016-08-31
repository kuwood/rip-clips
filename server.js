const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const authConfig = require('./oauth')
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

app.use(cookieParser());
app.use(cookieSession({
    secret: "somesecrettokenhere"
}));

// parse application/x-www-form-urlencoded
//app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())

app.use(passport.initialize())
app.use(passport.session());

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
    Clip.find({}),
    function(err, clip) {
        console.log(req.clip);
        res.status(200).json(req.clip)
    };
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
    // Successful authentication, redirect home.
    //req.session.user = req.user
    //console.log(req.query);
    //console.log(req.body);
    res.sendStatus(200);
});

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/')
});

app.get("/account", ensureAuthenticated, function(req, res) {
    res.sendStatus(200)
})

app.get("/myclips", ensureAuthenticated, function(req, res) {
    User.find({
        twitchId: req.user.twitchId
    }, function(err, user) {
        res.status(200).json(req.user.clips)
    });
})
//need to add new clip to frontend myclips list
app.post("/scrape", function(req, res) {
    url = req.body.link
    console.log(req.body);
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
            userClip.save()

            res.status(201).json(userClip)
        } else {
            res.status(500).json(error)
        }
    })
})

/*app.post("/clips", ensureAuthenticated, function(req, res) {
    Clip.create({

    })
})*/

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
