var _ = require('lodash')
var EventEmitter = require('events').EventEmitter;
var objectAssign = require('object-assign');

var Campaign = require('../models/campaign');
var Source = require('../models/source')
var Target = require('../models/target')

var RunCampaign = require('../campaign/Campaign');

var DatabaseContainer = require('../utils/DatabaseContainer')

var CampaignApi = objectAssign({}, EventEmitter.prototype, {
    get: function(data, res) {

    },

    getAll: function(user, res) {
        // console.log(user)
        
        // Campaign.find({}, function(error, doc) {
        //     if (error) return res(error);

        //     return res(null, doc)
        // });

        Campaign.findByUser({}, user._id, function(error, doc) {
            console.log(doc)
            if (error) return res(error);

            return res(null, doc)
        })
    },

    create: function(socket, user, data, res) {
        var campaign = new Campaign(data);

        // var sourceIds = [];
        // var targetIds = [];

        // _.forEach(data.sources, function(source) {
        //     var source = new Source(source);
        //     source.save(function(error) {
        //         if (error) res(error);
        //         sourceIds.push(source._id)
        //     })
        // })

        // _.forEach(data.targets, function(target) {
        //     var target = new Source(target);
        //     target.save(function(error) {
        //         if (error) res(error);
        //         console.log(target);
        //         targetIds.push(target._id)
        //     })
        // })

        // data.sources = sourceIds,
        // data.targets = targetIds;

        campaign.author = user._id
        campaign.state = "running"

        campaign.save(function(error) {
            if (error) return res(error, null);

            // TODO: do this in model
            Campaign.populate(campaign, [{path: "sources"}, {path: "targets"}], 
                function(error, campaign) {
                    if (error) return res(error, null);

                    res(null, campaign)
                    
                    runCampaign = new RunCampaign(campaign)
                    runCampaign.start(socket)

                    // TODO: for future work, this should be done in a more dynamic way
                    CampaignApi.on("stop", function(id) {
                        console.log("received stop event")
                        if (id == campaign._id) {
                            console.log("stopping campaign...")
                            runCampaign.stop();
                        }
                    })

                })
        });
    },

    update: function(data, res) {

    },

    destroy: function(user, data, res) {
        console.log(data);
        Campaign.remove({_id: data._id}, res)
    },

    stop: function(user, data, res) {
        // Campaign.update({_id: data._id}, {state: "completed"}, res);

        Campaign.findByIdAndUpdate(data._id, {state: "completed"}, {"new": true}, res)
        CampaignApi.emit("stop", data._id)
    },

    getGraph: function(id, res) {
        // TODO: persist the graph
        var redisClient = DatabaseContainer.getRedis();      

        var key = id + ":graph";

        redisClient.get(key, res);
    },

    getLineGraph: function(id, res) {
        // TODO: persist the graph
        var redisClient = DatabaseContainer.getRedis();      

        var key = id + ":linegraph";

        redisClient.get(key, res);
    }
})

module.exports = CampaignApi;
