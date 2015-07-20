var _ = require('lodash')
var async = require('async');
var config = require("../config/config")
var Twitter = require('twitter')
var DatabaseContainer = require('../utils/DatabaseContainer')


function TwitterRest(campaign) {
    this.campaign = campaign;
    this.client = new Twitter(config.twitter);

    this.startDate = null;
    this.limits = {};

    this.grid = DatabaseContainer.getGrid();
    this.ws = gfs.createWriteStream({
        filename: "network:" + campaign._id,
        content_type: "json"
    })
}

TwitterRest.prototype = {

    start: function() {
        var sources = this.campaign.sources;
        var targets = this.campaign.targets;

        this.client.get('application/rate_limit_status', {
            resources: 'followers,friends'
        }, function(error, limits, res) {

            this.startDate = new Date();

            _.forEach(limits.resources, function(resource, key) {
                this.limits[key] = resource;
            }.bind(this));

            // console.log(limits)
            // console.log(this.limits)


            this.getSources(sources);
            // this.getTargets(targets);

        }.bind(this))
    },

    getSources: function(sources) {
        async.each(sources, this.getSourceFollowers.bind(this), function(error) {
            if (error) throw error;

            console.log('done!')
        })
    },


    getSourceFollowers: function(source, done) {
        var cursor = -1;
        var count = 0; 

        async.whilst(function() {
            return cursor !== 0 && (this.limits.followers['/followers/ids'].remaining > 0)
                && count++ < 2;
        }.bind(this), function(cb) {
            this.client.get('followers/ids', { // https://dev.twitter.com/rest/reference/get/followers/ids
                screen_name: source.screen_name,
                count: 5000
            }, function(error, followers, response) {
                if (error) {
                    return cb(error);
                }

                console.log('called')
                console.log(followers)

                this.limits.followers['/followers/ids'].remaining -= 1;
                this.writeIds(source, followers.ids);

                cursor = followers.next_cursor;

                return cb();
            }.bind(this));    
        }.bind(this), function (error) {
            done(error);
        }.bind(this))
    },

    // getTargets: function(targets) {

    // },


    // getTargetFriends: function(targets) {
    //     this.client.get('friends/ids', { // https://dev.twitter.com/rest/reference/get/followers/ids
    //         user_id: source.user_id,
    //         count: 5000
    //     }, cb
    // },

    writeIds: function(target, ids) {
        
    }
}

module.exports = TwitterRest;