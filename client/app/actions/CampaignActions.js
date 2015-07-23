var AppDispatcher = require('../dispatcher/AppDispatcher')
var ApiConstants = require('../constants/ApiConstants')
// var RouterContainer = require('../util/RouterContainer')

var CampaignActions = {

    create: function(campaign) {
        AppDispatcher.dispatch({
            actionType: ApiConstants.CREATE_CAMPAIGN,
            campaign: campaign
        })
    },

    receiveAll: function(campaigns) {
        AppDispatcher.dispatch({
            actionType: ApiConstants.RECEIVE_ALL_CAMPAIGN,
            campaigns: campaigns
        })
    }
}

module.exports = CampaignActions