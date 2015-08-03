var path = require("path");
var env = process.env.NODE_ENV;

// passport Twitter auth
var CONSUMER_KEY = "1XVhobp0z3j769iCZKAIiKQ5l",
    CONSUMER_SECRET = "Z4RknHUl7LObheyXvGA4RjBBk0zPnlPQuyqHCMB5qotcoKj2YV",
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
        consumer_key: '1XVhobp0z3j769iCZKAIiKQ5l',
        consumer_secret: 'Z4RknHUl7LObheyXvGA4RjBBk0zPnlPQuyqHCMB5qotcoKj2YV',
        access_token_key: '1646770106-rKdnWSmUVYAUqcHn2c0COo6XieZWE0qRjBfBj74',
        access_token_secret: '4IWMzqe9B6Dq4c61jAC2hFr3P9Cj03IKMqYLP5ctaaFtv'
    },

    "passportTwitter": {
        consumerKey: CONSUMER_KEY,
        consumerSecret: CONSUMER_SECRET,
        callbackURL: CALLBACK_URL
    }
}