var mongoose = require("mongoose"),
    Schema = mongoose.Schema

var _ = require('lodash')

var Source = require('./source')
var Target = require('./target')

var campaignSchema = new Schema({
    name: String,
    description: String,
    author: { type: Schema.Types.ObjectId, ref: 'Account' },
    handle: String,
    creationDate: { type: Date },

    startDate: { type: Date, max: Date('2020-10-10') },
    endDate: { type: Date, max: Date('2020-10-10') },

    completed: Boolean,
    running: Boolean,

    sources: [{ type: Schema.Types.ObjectId, ref: 'Source'}],
    targets: [{ type: Schema.Types.ObjectId, ref: 'Target'}],
    // sources: [Schema.Types.ObjectId],
    // targets: [Schema.Types.ObjectId],

    tweets: Schema.Types.ObjectId,
    followers: Schema.Types.ObjectId,
    network: Schema.Types.ObjectId
    // results: {
    //     graph: 
    // }
})

campaignSchema.statics.findByUser = function(query, userId, cb) {
    return this.find({author: userId}, cb)
}

var Campaign = mongoose.model('Campaign', campaignSchema);

// Campaign.schema.path('sources').validate(function (sources, cb) {
//     _.forEach(sources, function(source) {
//         Source.findOne({"_id": source}, function(error, doc) {
//             error || !doc ? cb(false) : cb(true); 
//         });
//     })
// })

// Campaign.schema.path('targets').validate(function (targets, cb) {
//     _.forEach(targets, function(target) {
//         Target.findOne({"_id": target}, function(error, doc) {
//             error || !doc ? cb(false) : cb(true); 
//         });
//     })
// })

module.exports = Campaign;
// module.exports = mongoose.model('Campaign', campaignSchema);
