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
        _socket.emit('Campaign.create', campaign, function(error, data) {
            console.log("got campaign response")
            console.log(data)
            if (cb && error) return cb(error);

            ApiActions.create(data._id, data);

            if (cb) return cb(null, data._id);
        })
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

    deleteCampaign: function(id) {
        _socket.emit('Campaign.destroy', {_id: id}, function(error, data) {
            if (error) throw error;

            ApiActions.delete(id);
        })
    },

    stopCampaign: function(id) {
        _socket.emit('Campaign.stop', {_id: id}, function(error, data) {
            if (error) throw error;

            console.log(data);
            ApiActions.update(data._id, data);
        })
    },

    getSources: function() {
        _socket.emit('Source.getAll', function(error, data) {
            console.log("got sources")
            if (error) throw error;

            var sources = {};
            _.forEach(data, function(source) {
                sources[source._id] = source;
            })

            ApiActions.receiveAllSources(sources);
        })
    },

    getTargets: function() {
        console.log('called getTargets')
        _socket.emit('Target.getAll', function(error, data) {
            console.log('got targets')
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

    removeSource: function(id) {
        _socket.emit("Source.remove", {_id: id}, function(error, data) {
            if (error) throw error;

            ApiActions.removeSource(id);
        })
    },

    createTarget: function(screenName) {
        _socket.emit("Target.create", {screen_name: screenName}, function(error, data) {
            if (error) throw error;

            ApiActions.createTarget(data);
        })
    },

    removeTarget: function(id) {
        console.log('emitting remove target')
        _socket.emit("Target.remove", {_id: id}, function(error, data) {
            if (error) throw error;

            ApiActions.removeTarget(id);
        })
    }
}

module.exports = ApiService
