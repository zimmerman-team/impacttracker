var _ = require('lodash')
var EventEmitter = require('events').EventEmitter;
var objectAssign = require('object-assign');

var Campaign = require('../models/campaign');
var Source = require('../models/source')
var Target = require('../models/target')

var startCampaign = require('../campaign/util').startCampaign;
var planCampaign = require('../campaign/util').planCampaign;
var stopCampaign = require('../campaign/util').stopCampaign;

var CampaignApi = objectAssign({}, EventEmitter.prototype, {

    get: function(data, res) {

    },

    getAll: function(user, res) {
        Campaign.findByUser({}, user._id, function(error, doc) {
            if (error) return res(error);

            return res(null, doc)
        })
    },

    create: function(socket, user, data, res) {
        var campaign = new Campaign(data);

        console.log(data)

        if (campaign.startDate) campaign.startDate = new Date(campaign.startDate)
        if (campaign.endDate) campaign.endDate = new Date(campaign.endDate)
        campaign.author = user._id
        campaign.state = "getting followers/friends"
        campaign.running = true

        campaign.save(function(error) {
            if (error) return res(error, null);

            console.log(campaign)

            Campaign.populate(campaign, [{path: "sources"}, {path: "targets"}, {path: "author"}], 
                function(error, campaign) {
                    if (error) return res(error, null);

                    res(null, campaign)

                    planCampaign(campaign)
                    
                }.bind(this))
        });
    },

    update: function(data, res) {

    },

    destroy: function(user, data, res) {
        stopCampaign(data._id)
        Campaign.remove({_id: data._id}, res)
    },

    stop: function(user, data, res) {
        stopCampaign(data._id)
        Campaign.findByIdAndUpdate(data._id, {state: "completed"}, {running: false}, {"new": true}, res)
    },

    getGraph: function(user, id, res) {
        console.log(id)
        Campaign.findOneByUser({_id: id}, user._id, function(error, doc) {
            if (error) return res(error);
            console.log(doc)

            return res(null, doc.networkGraph)
        })
    },

    getLineGraph: function(user, id, res) {
        Campaign.findOneByUser({_id: id}, user._id, function(error, doc) {
            if (error) return res(error);

            return res(null, doc.lineGraph)
        })
    }
})


module.exports = CampaignApi;
