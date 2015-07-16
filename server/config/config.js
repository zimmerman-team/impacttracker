var path = require("path");
var env = process.env.NODE_ENV;

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
    }
}