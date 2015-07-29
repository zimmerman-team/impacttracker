var request = require("superagent")
var _ = require('lodash')
var ApiActions = require("../actions/CampaignActions")

var _socket = null;

var ApiService = {


    socketOn: function(event, cb) {
        _socket.on(event, cb)
    },

    socketOff: function(event, cb) {
        _socket.removeListener(event, cb)
    },

    getSocket: function() {
        return _socket;
    },

    setSocket: function(socket) {
        _socket = socket;
    },

    init: function(socket) {
        _socket = socket;

        ApiService.getCampaigns();
        ApiService.getSources();
        ApiService.getTargets();
    },

    createCampaign: function(campaign, cb) {
        console.log(campaign)
        _socket.emit('Campaign.create', campaign, function(error, data) {
            console.log(data)
            if (error) throw error;
            ApiActions.create(data._id, data);

            if (cb) cb(data._id);
        })
    },

    getCampaign: function() {
    
    },

    getCampaigns: function() {
        _socket.emit('Campaign.getAll', function(error, data) {
            if (error) throw error;

            var campaigns = {};
            _.forEach(data, function(campaign) {
                campaigns[campaign._id] = campaign;
            })

            console.log(campaigns)

            ApiActions.receiveAll(campaigns);
        })
    },

    updateCampaign: function(campaign, cb) {
        _socket.emit('Campaign.update', {campaign}, function(error, data) {
            if (error) throw error;
            ApiActions.update(data)

            if (cb) cb(data._id);
        })
    },

    getSources: function() {
        _socket.emit('Source.getAll', function(error, data) {
            console.log("got a reponse")
            if (error) throw error;

            var sources = {};
            _.forEach(data, function(source) {
                sources[source._id] = source;
            })

            ApiActions.receiveAllSources(sources);
        })
    },

    getTargets: function() {
        _socket.emit('Target.getAll', function(error, data) {
            if (error) throw error;

            var targets = {};
            _.forEach(data, function(target) {
                targets[target._id] = target;
            })

            ApiActions.receiveAllTargets(targets);
        })
    },

    createSource: function(screenName) {
        _socket.emit("Source.create", {screen_name: screenName}, function(error, data) {
            if (error) throw error;

            ApiActions.createSource(data);
        })
    },

    createTarget: function(screenName) {
        _socket.emit("Target.create", {screen_name: screenName}, function(error, data) {
            if (error) throw error;

            ApiActions.createTarget(data);
        })
    }
}

module.exports = ApiService