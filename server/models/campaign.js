var mongoose = require("mongoose"),
    Schema = mongoose.Schema

var Source = require('./source')
var Target = require('./target')

var campaignSchema = new Schema({
    name: String,
    description: String,
    author: { type: Schema.Types.ObjectId, ref: 'Account' },
    handle: String,
    createdAt: { type: Date },
    runAt: { type: Date, max: Date('2020-10-10') },
    completed: Boolean,

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

// campaignSchema.methods.save = function() {

// }

var Campaign = mongoose.model('Campaign', campaignSchema);

Campaign.schema.path('sources').validate(function (value, cb) {
    Source.findOne({"_id": value}, function(error, doc) {
        error || !doc ? cb(false) : cb(true); 
    });
})

Campaign.schema.path('targets').validate(function (value, cb) {
    Target.findOne({"_id": value}, function(error, doc) {
        error || !doc ? cb(false) : cb(true); 
    });
})

module.exports = Campaign;
// module.exports = mongoose.model('Campaign', campaignSchema);
