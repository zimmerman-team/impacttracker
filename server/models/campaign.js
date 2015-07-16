var mongoose = require("mongoose"),
    Schema = mongoose.Schema

var Campaign = new Schema({
    name: String,
    description: String,
    author: { type: Schema.Types.ObjectId, ref: 'Account' },
    handle: String,
    createdAt: { type: Date },
    runAt: { type: Date, max: Date('2020-10-10') },

    sources: [{ type: Schema.Types.ObjectId, ref: 'SourceTarget'}],
    targets: [{ type: Schema.Types.ObjectId, ref: 'SourceTarget'}],

    tweets: Schema.Types.ObjectId,
    followers: Schema.Types.ObjectId,
    network: Schema.Types.ObjectId
    // results: {
    //     graph: 
    // }
})


module.exports = mongoose.model('Campaign', Campaign)