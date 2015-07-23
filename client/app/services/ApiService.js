var request = require("superagent")
var ApiActions = require("../actions/CampaignActions")

var _socket = null;

var ApiService = {

    setSocket: function(socket) {
        _socket = socket;
    },

    init: function(socket) {
        _socket = socket;

        ApiService.getCampaigns();
        // ApiService.getSources();
        // ApiService.getTargets();
    },

    createCampaign: function(campaign) {
        _socket.emit('Campaign.create', campaign, function(error, data) {
            if (error) throw error;
            ApiActions.createCampaign(data);
        })
    },

    getCampaign: function() {
    
    },

    getCampaigns: function() {
        _socket.emit('Campaign.getAll', function(error, data) {
            if (error) throw error;
            ApiActions.receiveAll(data);
        })
    },

    createSource: function(source) {
        this.socket.emit("Source.create", source, function(error, data) {
            if (error) throw error;

            ApiActions.createSource(data);
        })
    },

    createTarget: function(target) {
        this.socket.emit("Target.create", source, function(error, data) {
            if (error) throw error;

            ApiActions.createTarget(data);
        })
    },

}

module.exports = ApiService