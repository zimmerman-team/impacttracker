var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
var TwitterAccount = require('./models/twitterAccount');
var Account = require('./models/account');
var config = require('./config/config.js')
var LocalStrategy = require('passport-local').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;


module.exports = passport.use(new TwitterStrategy(config.passportTwitter,
  function(token, tokenSecret, profile, done) {
    TwitterAccount.findOne({twitter_id: profile.id}, function(error, user) {
      console.log(user);
      console.log(token);
      console.log(tokenSecret);
      if (user) 
        user.access_token = token;
        user.access_token_secret = tokenSecret;
        user.save()
        return done(error, user);

      user = new TwitterAccount
      user.twitter_id = profile.id
      user.name = profile.username
      user.screen_name = profile.displayName
      user.description = profile._json.description
      user.url = profile._json.url

      user.access_token = token
      user.access_token_secret = tokenSecret

      user.save(function(error) {
        done(error, user);
      })
    })
}));

passport.use(new LocalStrategy(Account.authenticate()));
