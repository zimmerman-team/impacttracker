var path = require("path");
var config = require("./config/config.js");
var express = require("express");
var app = express();
var server = require('http').Server(app);
var io               = require("socket.io")(server);
var passportSocketIo = require("passport.socketio");
var session = require('express-session')

if (config.env === "development") {
    app.use(express.static(config.static_root))

    app.get("/", function(req, res) {
        res.sendFile(path.join(config.static_root + '/index.html'));
    })

    var MongoStore = require("connect-mongo")(session);
    var sessionStore = new MongoStore(config.sessionStore)

} else {
    var redisStore = require("connect-redis")(session);
    var sessionStore = new redisStore(config.sessionStore);
}

app.use(session({
    secret: 'foo',
    resave: false,
    saveUninitialized: false,
    store: sessionStore
}))

io.

io.use(passportSocketIo.authorize({
  cookieParser: require('cookie-parser'),
  key:          'express.sid',       // the name of the cookie where express/connect stores its session_id
  secret:       'session_secret',    // change this
  store:        sessionStore,
  success:      onAuthorizeSuccess,
  fail:         onAuthorizeFail,
}));

function onAuthorizeSuccess(data, accept){
  console.log('successful connection to socket.io');

  console.log(data);

  accept();
}

function onAuthorizeFail(data, message, error, accept){
  console.log('failed connection to socket.io:', message);

  if(error)
    accept(new Error(message));
  // this error will be sent to the user as a special error-package
  // see: http://socket.io/docs/client-api/#socket > error-object
}



server.listen(2000)