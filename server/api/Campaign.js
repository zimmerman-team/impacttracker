var Campaign = require('../models/campaign');

var CampaignApi = {
    get: function(data, res) {

    },

    getAll: function(data, res) {

    },

    create: function(user, data, res) {
        var campaign = new Campaign(data);
        
        campaign.save(function(error) {
            if (error) res(error);
        });

        
    },

    update: function(data, res) {

    },

    remove: function(data, res) {

    }
}

module.exports = CampaignApi;