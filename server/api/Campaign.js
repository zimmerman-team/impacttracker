var _ = require('lodash')
var EventEmitter = require('events').EventEmitter;
var objectAssign = require('object-assign');
var TwitterStream = require('../campaign/TwitterStream')
var TwitterRest = require('../campaign/TwitterRest')
var CampaignResults = require('../campaign/CampaignResults')

var Campaign = require('../models/campaign');
var Source = require('../models/source')
var Target = require('../models/target')

var DatabaseContainer = require('../utils/DatabaseContainer')

var CampaignApi = objectAssign({}, EventEmitter.prototype, {
    get: function(data, res) {

    },

    getAll: function(user, res) {
        
        Campaign.find({}, function(error, doc) {
            if (error) return res(error);

            return res(null, doc)
        });

        // Campaign.findByUser({}, {user._id}, function(error, doc) {
        //     if (error) return res(error);

        //     return res(null, doc)
        // })
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

        campaign.state = "running"

        campaign.save(function(error) {
            if (error) return res(error, null);

            res(null, campaign)

            console.log(campaign)

            Campaign.populate(campaign, [{path: "sources"}, {path: "targets"}], 
                function(error, doc) {
                    console.log(doc)


                    // todo: cron-like scheduler / job-queue like celery or kue
                    twitterStream = new TwitterStream(doc); 
                    twitterStream.track()

                    twitterRest = new TwitterRest(doc);
                    twitterRest.start() 

                    campaignResults = new CampaignResults(doc);

                    campaignResults.on("new-node", function(node) {
                        socket.broadcast.emit(doc._id + ":new-node", node)
                    }.bind(this));

                    campaignResults.on("new-link", function(link) {
                        socket.broadcast.emit(doc._id + ":new-link", link)
                    }.bind(this));

                    campaignResults.on("new-tweet", function(tweet) {
                        socket.broadcast.emit(doc._id + ":new-tweet", tweet)
                    }.bind(this));                    

                    socket.on("new-graph", function(data, res) {
                        console.log("got a graph request")
                        res(campaignResults.getGraph)
                    }.bind(this));

                    // campaignResults.on("new-node", socket.emit.bind(this, "new-node"));
                    // campaignResults.on("new-link", socket.emit.bind(this, "new-link"));

                    twitterRest.on("completed", function() {
                        console.log("twitter rest was completed")


                        Campaign
                            .findOne({ _id: this.campaign._id})
                            .populate([{path: "sources"}, {path: "targets"}])
                            .exec(function(error, campaign) {
                                // if (error) throw error;

                                campaignResults.campaign = campaign
                                campaignResults.start()
                            }.bind(this))
                            
                    });

                    function stopCampaign() { // emitting stop initiates clean-up
                        twitterStream.emit("stop");
                        twitterRest.emit("stop");
                        campaignResults.emit("stop");
                    }

                    CampaignApi.once("stop", function(id) {
                        console.log("received stop event")
                        if (id == doc._id) {
                            console.log("stopping campaign...")
                            stopCampaign();
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
        var redisClient = DatabaseContainer.getRedis();      

        var key = id + ":graph";

        redisClient.get(key, res);
    },

    getLineGraph: function(id, res) {
        var redisClient = DatabaseContainer.getRedis();      

        var key = id + ":linegraph";

        redisClient.get(key, res);
    }
})

module.exports = CampaignApi;