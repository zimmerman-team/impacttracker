var mongoose = require("mongoose"),
    Schema = mongoose.Schema

var TwitterAccountSchema = new Schema({
    twitter_id: Number,
    name: String,
    screen_name: String,
    description: String,
    url: String,
    access_token: String,
    access_token_secret: String
})

module.exports = mongoose.model('TwitterAccount', TwitterAccountSchema)
