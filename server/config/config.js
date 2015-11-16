var path = require("path");
var env = process.env.NODE_ENV;

// passport Twitter auth
var CONSUMER_KEY = "P9Id7LbihYtpChutifnC8Kt4y",
    CONSUMER_SECRET = "XoR7DtehlDOAELUbAuu7vpl4ILbgUqnFBjmCPiudSHOGoc9Vxk",
    CALLBACK_URL = "http://localhost:2000/auth/twitter/callback";

module.exports = {
    'port': 2000,
    "env": env,
    "static_root": path.join(process.cwd(), "public"),

    "sessionStore": {
        "url": "mongodb://localhost:27017/impacttracker-sessions"
        // "host": "localhost",
        // "port": 27017,
    },

    "database": {
        "url": "mongodb://localhost:27017/impacttracker-dev"
    },

    "redis": {
        "db": 0
    },

    "twitter": {
        consumer_key: CONSUMER_KEY,
        consumer_secret: CONSUMER_SECRET
        // access_token_key: '1646770106-rKdnWSmUVYAUqcHn2c0COo6XieZWE0qRjBfBj74', // default: application token
        // access_token_secret: '4IWMzqe9B6Dq4c61jAC2hFr3P9Cj03IKMqYLP5ctaaFtv' // default: application token secret
    },

    "passportTwitter": {
        consumerKey: CONSUMER_KEY,
        consumerSecret: CONSUMER_SECRET,
        callbackURL: CALLBACK_URL
    }
}
