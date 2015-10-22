var _ = require('lodash')
var moment = require('moment')
var DatabaseContainer = require('../utils/DatabaseContainer')
var RunCampaign = require('../campaign/Campaign');
var Campaign = require('../models/campaign');

// campaigns
_campaigns = {};

// contains timeouts to call startCampaign
_plannedCampaigns = [];

/*
 * Run a campaign 
*/
function startCampaign(campaign) {
    io = DatabaseContainer.getIo(); // for socket broadcasting
    console.log(io.sockets.broadcast)

    runCampaign = new RunCampaign(campaign)
    runCampaign.start(io.sockets)

    // keep reference
    _campaigns[campaign._id] = runCampaign;

}

function stopCampaign(campaignId) {
    console.log('stopping campaign...')
    campaign = _campaigns[campaignId];
    if (campaign) {
        _campaigns[campaignId].stop();
        delete _campaigns[campaignId];
        delete _plannedCampaigns[campaignId]
    }
}

function planCampaign(campaign) {
    start_date = campaign.startDate;

    // milliseconds from now the campaign should start
    var timeout = moment(campaign.startDate).diff(moment(), 'millisecond')
    console.log(timeout)
    // var timeout = moment(campaign.startDate).fromNow().Get('millisecond')

    if (timeout <= 0) { return startCampaign(campaign) }

    _plannedCampaigns[campaign._id] = 
        setTimeout(startCampaign.bind(null, campaign), timeout)
}

/*
 * 1. Resume campaign execution where (startDate < now) && (endDate > now)
 * 2. Plan campaign on startDate where (startDate > now) 
*/
function initializeCampaigns() {
    console.log('called initialize')
    // 1.
    Campaign.findPopulated({
        startDate: {"$lte": Date.now()},
        endDate: {"$gte": Date.now() },
        state: "running"
    }, function(error, campaigns) {
        console.log(campaigns)
        if (error) return console.error(error);
        _.forEach(campaigns, planCampaign);
    })

    // 2.
    Campaign.findPopulated({
        startDate: {"$gte": Date.now()},
        state: "completed"
    }, function(error, campaigns) {
        console.log(campaigns)
        if (error) return console.error(error);
        _.forEach(campaigns, planCampaign);
    })
}

module.exports = {
    startCampaign: startCampaign,
    planCampaign: planCampaign,
    stopCampaign: stopCampaign,
    initializeCampaigns: initializeCampaigns
}


