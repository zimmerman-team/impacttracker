var objectAssign = require('object-assign')
var BaseStore = require("./BaseStore")
var AppDispatcher = require('../dispatcher/AppDispatcher');
var ApiConstants = require("../constants/ApiConstants")

var _campaigns = {};
var _sources = {};
var _targets = {};


function create(id, campaign) {
    _campaigns[id] = campaign;   
}

function update(id, campaign) {
    _campaigns[id] = campaign;
}

function destroy(id) {
    delete _campaigns[id];
}

function createSource(id, source) {
    _sources[id] = source;
}

function createTarget(id, target) {
    _targets[id] = target;
}

function addSource(campaignId, sourceId) {
    _campaigns[campaignId].sources.push(sourceId)
}

function addTarget(campaignId, targetId) {
    _campaigns[campaignId].targets.push(targetId)
}


var CampaignStore = objectAssign({}, BaseStore, {

    get: function(key) {
        return _campaigns[key];
    },

    getAll: function() {
        return _campaigns;
    },

    getAllSources: function() {
        return _sources;
    },

    getAllTargets: function() {
        return _targets;
    },

    dispatcherIndex: AppDispatcher.register(function(action) {

        switch(action.actionType) {
            case ApiConstants.RECEIVE_ALL_CAMPAIGN:
                _campaigns = action.campaigns
                CampaignStore.emitChange();
                break;
            case ApiConstants.RECEIVE_ALL_SOURCES:
                _sources = action.sources
                CampaignStore.emitChange();
                break;
            case ApiConstants.RECEIVE_ALL_TARGETS:
                _targets = action.targets
                CampaignStore.emitChange();
                break;

            case ApiConstants.CREATE_CAMPAIGN:
                create(action.id, action.campaign)
                CampaignStore.emitChange();
                break;

            case ApiConstants.UPDATE_CAMPAIGN:
                update(action.id, action.campaign)
                CampaignStore.emitChange();
                break;

            case ApiConstants.DESTROY_CAMPAIGN:
                destroy(action.id)
                CampaignStore.emitChange();
                break;

            case ApiConstants.CREATE_SOURCE:
                console.log('emitting source change...')
                createSource(action.id, action.source)
                CampaignStore.emitChange();
                break;

            case ApiConstants.CREATE_TARGET:
                createTarget(action.id, action.target)
                CampaignStore.emitChange();
                break;

            case ApiConstants.ADD_SOURCE:
                console.log('emitting source change...')
                addSource(action.campaignId, action.sourceId)
                CampaignStore.emitChange();
                break;

            case ApiConstants.ADD_TARGET:
                addTarget(action.campaignId, action.targetId)
                CampaignStore.emitChange();
                break;
        }
    })
})

module.exports = CampaignStore