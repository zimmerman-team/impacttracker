var config = require("../config/config")
var Q = require('q');
var _ = require('lodash');
var moment = require("moment")

var Campaign = require('../models/campaign');

var TwitterStream = require('../campaign/TwitterStream')
var TwitterRest = require('../campaign/TwitterRest')
var CampaignResults = require('../campaign/CampaignResults')

function RunCampaign(campaign) {
    this.campaign = campaign;

    // A timeout to stop campaign on endDate
    this.stopTimeout = null;
}

RunCampaign.prototype.setStopTimeout = function() {

    // var timeout = moment(moment()).diff(moment(this.endDate)), 'millisecond')

    // if timeout > 0 {

    // }
}

RunCampaign.prototype.bindSocketEvents = function(sockets) {
    // TODO: bind these events using broadcast socket (all sockets)
    this.campaignResults.on("new-node", function(node) {
        sockets.emit(this.campaign._id + ":new-node", node)
    }.bind(this));

    this.campaignResults.on("new-link", function(link) {
        sockets.emit(this.campaign._id + ":new-link", link)
    }.bind(this));

    this.campaignResults.on("new-tweet", function(tweet) {
        sockets.emit(this.campaign._id + ":new-tweet", tweet)
    }.bind(this));                    

    // socket.on("new-graph", function(data, res) {
    //     console.log("got a graph request")
    //     res(this.campaignResults.getGraph)
    // }.bind(this));
}

/*
 * Start a campaign
 * {sockets} is a global broadcast socket
*/
RunCampaign.prototype.start = function(sockets) {

    // todo: cron-like scheduler / job-queue like celery or kue
    this.twitterStream = new TwitterStream(this.campaign); 
    this.twitterStream.track()

    this.twitterRest = new TwitterRest(this.campaign);
    this.twitterRest.start() 

    // starts after twitterREST is completed
    this.campaignResults = new CampaignResults(this.campaign);

    this.bindSocketEvents(sockets)

    // campaignResults.on("new-node", sockets.emit.bind(this, "new-node"));
    // campaignResults.on("new-link", sockets.emit.bind(this, "new-link"));

    this.twitterRest.once("completed", function() {
        Campaign.findByIdAndUpdate(this.campaign._id, {state: "running"})
        Campaign.findOnePopulated({_id: this.campaign._id}, function(error, campaign) {
            if (error) throw error;
            console.log("starting campaign..")
            this.campaignResults.campaign = campaign
            this.campaignResults.start()
        }.bind(this))
    }.bind(this));
}

RunCampaign.prototype.stop = function() {
    this.twitterStream.emit("stop");
    this.twitterRest.emit("stop");
    this.campaignResults.emit("stop");

    // TODO: unbind events and the like on stop (avoid memory leaks)
}

module.exports = RunCampaign; 
