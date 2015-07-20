var mongoose = require("mongoose"),
    Schema = mongoose.Schema


var Target = new Schema({
    author: { type: Schema.Types.ObjectId, ref: 'Account' },
    user_id: String,
    screen_name: String,
    categories: [String]
})

module.exports = mongoose.model('Target', Target)
