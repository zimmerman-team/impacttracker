var config = require("../config/config")
var Q = require('q');
var _ = require('lodash');

var Campaign = require('../models/campaign');

var TwitterStream = require('../campaign/TwitterStream')
var TwitterRest = require('../campaign/TwitterRest')
var CampaignResults = require('../campaign/CampaignResults')

function RunCampaign(campaign) {
    this.campaign = campaign;
}

RunCampaign.prototype.stop = function() {
    this.twitterStream.emit("stop");
    this.twitterRest.emit("stop");
    this.campaignResults.emit("stop");

    // TODO: unbind events and the like
}

RunCampaign.prototype.bindSocketEvents = function(socket) {
    this.campaignResults.on("new-node", function(node) {
        socket.broadcast.emit(this.campaign._id + ":new-node", node)
    }.bind(this));

    this.campaignResults.on("new-link", function(link) {
        socket.broadcast.emit(this.campaign._id + ":new-link", link)
    }.bind(this));

    this.campaignResults.on("new-tweet", function(tweet) {
        socket.broadcast.emit(this.campaign._id + ":new-tweet", tweet)
    }.bind(this));                    

    // socket.on("new-graph", function(data, res) {
    //     console.log("got a graph request")
    //     res(this.campaignResults.getGraph)
    // }.bind(this));
}

RunCampaign.prototype.start = function(socket) {

    // todo: cron-like scheduler / job-queue like celery or kue
    this.twitterStream = new TwitterStream(this.campaign); 
    this.twitterStream.track()

    this.twitterRest = new TwitterRest(this.campaign);
    this.twitterRest.start() 

    // starts after twitterREST is completed
    this.campaignResults = new CampaignResults(this.campaign);

    this.bindSocketEvents(socket)

    // campaignResults.on("new-node", socket.emit.bind(this, "new-node"));
    // campaignResults.on("new-link", socket.emit.bind(this, "new-link"));

    this.twitterRest.once("completed", function() {
        Campaign.findOnePopulated({_id: this.campaign._id}, function(error, campaign) {
            if (error) throw error;
            console.log("starting campaign..")
            this.campaignResults.campaign = campaign
            this.campaignResults.start()
        }.bind(this))
    }.bind(this));

}

module.exports = RunCampaign; 
