var objectAssign = require('object-assign')
var BaseStore = require("./BaseStore")
var AppDispatcher = require('../dispatcher/AppDispatcher');
var ApiConstants = require("../constants/ApiConstants")

var _campaigns = {};

var CampaignStore = objectAssign({}, BaseStore, {

    init: function() {

    },

    get: function(key) {
        return _campaigns[key];
    },

    getAll: function() {
        return _campaigns;
    },

    dispatcherIndex: AppDispatcher.register(function(action) {

        switch(action.actionType) {
            case ApiConstants.RECEIVE_ALL_CAMPAIGN:
                _campaigns = action.campaigns

                CampaignStore.emitChange();
                break;

            case ApiConstants.CREATE_CAMPAIGN:
                _campaigns[action.campaign.name] = campaign

                CampaignStore.emitChange();
                break;
        }
    })
})

module.exports = CampaignStore