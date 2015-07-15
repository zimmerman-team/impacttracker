var path = require("path");
var env = process.env.NODE_ENV;

module.exports = {
    "env": env,
    "static_root": path.join(process.cwd(), "public"),

    "sessionStore": {
        "url": "mongodb://localhost:27017/impacttracker-dev"
        // "host": "localhost",
        // "port": 27017,
    }
}