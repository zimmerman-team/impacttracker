var AppDispatcher = require('../dispatcher/AppDispatcher')
var ApiConstants = require('../constants/ApiConstants')
// var RouterContainer = require('../util/RouterContainer')

var CampaignActions = {

    create: function(id, campaign) {
        AppDispatcher.dispatch({
            actionType: ApiConstants.CREATE_CAMPAIGN,
            id: id,
            campaign: campaign
        })
    },

    update: function(id, campaign) {
        AppDispatcher.dispatch({
            actionType: ApiConstants.UPDATE_CAMPAIGN,
            id: id,
            campaign: campaign
        })
    },

    receiveAll: function(campaigns) {
        AppDispatcher.dispatch({
            actionType: ApiConstants.RECEIVE_ALL_CAMPAIGN,
            campaigns: campaigns
        })
    },

    delete: function(id) {
        console.log(id)
        console.log('called')
        AppDispatcher.dispatch({
            actionType: ApiConstants.DESTROY_CAMPAIGN,
            id: id
        })        
    },

    receiveAllSources: function(sources) {
        AppDispatcher.dispatch({
            actionType: ApiConstants.RECEIVE_ALL_SOURCES,
            sources: sources 
        })
    },

    receiveAllTargets: function(targets) {
        AppDispatcher.dispatch({
            actionType: ApiConstants.RECEIVE_ALL_TARGETS,
            targets: targets
        })
    },

    addSource: function(id, sourceId) {
        AppDispatcher.dispatch({
            actionType: ApiConstants.ADD_SOURCE,
            campaignId: id,
            sourceId: sourceId
        })
    },

    addTarget: function(id, targetId) {
        AppDispatcher.dispatch({
            actionType: ApiConstants.ADD_TARGET,
            campaignId: id,
            targetId: targetId
        })
    },

    createSource: function(source) {
        AppDispatcher.dispatch({
            actionType: ApiConstants.CREATE_SOURCE,
            id: source._id,
            source: source
        })
    },

    createTarget: function(target) {
        AppDispatcher.dispatch({
            actionType: ApiConstants.CREATE_TARGET,
            id: target._id,
            target: target
        })
    }
}

module.exports = CampaignActions