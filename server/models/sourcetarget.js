var mongoose = require("mongoose"),
    Schema = mongoose.Schema


var SourceTarget = new Schema({
    type: String,
    author: { type: Schema.Types.ObjectId, ref: 'Account' },
    name: String,
    categories: [String]
})

module.exports = mongoose.model('SourceTarget', SourceTarget)
