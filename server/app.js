var path = require("path");
var config = require("./config/config.js");
var express = require("express");
var bodyParser = require('body-parser')
var app = express();
var server = require('http').Server(app);
var io               = require("socket.io")(server);
var passportSocketIo = require("passport.socketio");
var session = require('express-session');
var mongoose = require("mongoose");
var passport = require("passport")
var LocalStrategy = require('passport-local').Strategy;

if (config.env === "development") {
    app.use(express.static(config.static_root))

    app.get("/", function(req, res) {
        res.sendFile(path.join(config.static_root + '/index.html'));
    })

    var MongoStore = require("connect-mongo")(session);
    var sessionStore = new MongoStore(config.database)

} else {
    var redisStore = require("connect-redis")(session);
    var sessionStore = new redisStore(config.database);
}

var Account = require('./models/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());


app.use(bodyParser.json());
app.use(session({
    key: 'express.sid',
    secret: 'foo',
    resave: false,
    saveUninitialized: false,
    store: sessionStore
}))
// app.use(express.cookieParser('your secret here'));
// app.use(express.session());
app.use(passport.initialize());
app.use(passport.session());


io.use(passportSocketIo.authorize({
  cookieParser: require('cookie-parser'),
  key:          'express.sid',       // the name of the cookie where express/connect stores its session_id
  secret:       'foo',    // change this
  store:        sessionStore,
  success:      onAuthorizeSuccess,
  fail:         onAuthorizeFail,
}));

function onAuthorizeSuccess(data, accept){
  console.log('succesfully authorized user');

  accept();
}

function onAuthorizeFail(data, message, error, accept){
  console.log('failed connection to socket.io:', message);

  if(error)
    accept(new Error(message));
  // this error will be sent to the user as a special error-package
  // see: http://socket.io/docs/client-api/#socket > error-object
}

// authentication middleware
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login')
}

var Campaign = require('./api/Campaign')

io.on('connection', function(socket) {

    var user = socket.request.user;

    // Twitter campaigns
    socket.on('Campaign.get', Campaign.get.bind(null, user));
    socket.on('Campaign.getAll', Campaign.getAll);
    socket.on('Campaign.create', Campaign.create.bind(null, user));
    socket.on('Campaign.update', Campaign.update);
    socket.on('Campaign.remove', Campaign.remove);


})


mongoose.connect(config.database.url)

require('./routes')(app);

server.listen(2000)
