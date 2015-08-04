var path = require("path");
var fs = require("fs")
var config = require("./config/config.js");
var express = require("express");
var bodyParser = require('body-parser')
var app = express();
var server = require('http').Server(app);
var io               = require("socket.io")(server);
var passportSocketIo = require("passport.socketio");
var session = require('express-session');
var passport = require("passport")

var redis = require('redis');
var mongoose = require("mongoose");

var DatabaseContainer = require('./utils/DatabaseContainer')

var auth = require('./auth')

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

// passport.serializeUser(Account.serializeUser());
// passport.deserializeUser(Account.deserializeUser());
passport.serializeUser(function(user, done) {
  console.log("serializing user:", user._id)
  done(null, user);
})
passport.deserializeUser(function(obj, done) {
  done(null, obj);
})

// app.use(function(req, res, next) {
//   res.header('Access-Control-Allow-Credentials', true);
//   res.header('Access-Control-Allow-Origin', "*");
//   next();
// })
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
  // see: http://socket.io/docs/client-api/#socket > error-object
  console.error('failed connection to socket.io:', message);

  if(error)
    accept(new Error(message));
}

var Campaign = require('./api/Campaign')
var Source = require('./api/Source')
var Target = require('./api/Target')

io.on('connection', function(socket) {

    var user = socket.request.user;

    // Twitter campaigns
    // socket.on('Campaign.get', Campaign.get.bind(null, user));
    socket.on('Campaign.getAll', Campaign.getAll.bind(null, user));
    socket.on('Campaign.create', Campaign.create.bind(null, socket, user));
    socket.on('Campaign.update', Campaign.update.bind(null, user));
    socket.on('Campaign.destroy', Campaign.destroy.bind(null, user));

    socket.on("Campaign.stop", Campaign.stop.bind(null, user))
    socket.on("Campaign.getGraph", Campaign.getGraph)
    socket.on("Campaign.getLineGraph", Campaign.getLineGraph)

    socket.on('Source.create', Source.create.bind(null, user));
    socket.on('Source.getAll', Source.getAll.bind(null, user));
    
    socket.on('Target.create', Target.create.bind(null, user));
    socket.on('Target.getAll', Target.getAll.bind(null, user));

})

mongoose.connect(config.database.url)
var connection = mongoose.connection;

redisClient = redis.createClient();

redisClient.select(config.redis.db, function(error, res) {
    if (error) throw error;

    connection.once('open', function() {

        DatabaseContainer.setDb(connection.db);
        DatabaseContainer.setRedis(redisClient);

        require('./routes')(app);

        server.listen(2000)
    })
})



