var mongoose = require("mongoose"),
    Schema = mongoose.Schema


var Source = new Schema({
    author: { type: Schema.Types.ObjectId, ref: 'Account' },
    user_id: String,
    screen_name: String,
    categories: [String]
})

Source.statics.findByUser = function(query, userId, cb) {
    query = query || {};
    query.author = userId;

    return this
        .find(query)
        .exec(cb)
}


module.exports = mongoose.model('Source', Source)
