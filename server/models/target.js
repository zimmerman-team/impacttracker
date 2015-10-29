var mongoose = require("mongoose"),
    Schema = mongoose.Schema


var Target = new Schema({
    author: { type: Schema.Types.ObjectId, ref: 'Account' },
    user_id: String,
    screen_name: String,
    categories: [String],
    fetched_friends: {type: Boolean, default: false}
})

Target.statics.findByUser = function(query, userId, cb) {
    query = query || {};
    query.author = userId;

    return this
        .find(query)
        .exec(cb)
}

Target.statics.findOneByScreenName = function(query, screenName, cb) {
    query = query || {};
    query.screen_name = screenName;

    return this
        .findOne(query)
        .exec(cb)
}

module.exports = mongoose.model('Target', Target)

