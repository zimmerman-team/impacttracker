var mongoose = require("mongoose"),
    Schema = mongoose.Schema

var passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
    username: String,
    password: String
})

Account.plugin(passportLocalMongoose);


module.exports = mongoose.model('Account', Account)