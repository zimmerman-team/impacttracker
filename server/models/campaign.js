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
    creationDate: { type: Date, default: Date.now },

    startDate: { type: Date },
    endDate: { type: Date },

    state: { type: String, default: "planned" },
    completed: Boolean,
    running: Boolean,

    sources: [{ type: Schema.Types.ObjectId, ref: 'Source'}],
    targets: [{ type: Schema.Types.ObjectId, ref: 'Target'}],
    // sources: [Schema.Types.ObjectId],
    // targets: [Schema.Types.ObjectId],

    networkGraph: Schema.Types.Mixed,
    lineGraph: Schema.Types.Mixed
    // results: {
    //     graph: 
    // }
})

campaignSchema.statics.findPopulated = function(query, cb) {
    return this
        .find(query)
        .populate([{path: "sources"}, {path: "targets"}])
        .exec(cb)
}

campaignSchema.statics.findOnePopulated = function(query, cb) {
    return this
        .findOne(query)
        .populate([{path: "sources"}, {path: "targets"}])
        .exec(cb)
}

campaignSchema.statics.findByUser = function(query, userId, cb) {
    query = query || {};
    query.author = userId;

    return this
        .find(query)
        .populate([{path: "sources"}, {path: "targets"}])
        .exec(cb)
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
