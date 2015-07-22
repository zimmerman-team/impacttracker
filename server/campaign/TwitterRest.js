var _ = require('lodash')
var async = require('async');
var config = require("../config/config")
var Twitter = require('twitter')
var EventEmitter = require('events').EventEmitter
var objectAssign = require('object-assign')
var DatabaseContainer = require('../utils/DatabaseContainer')


function TwitterRest(campaign) {
    this.campaign = campaign;
    this.client = new Twitter(config.twitter);

    this.startDate = null;
    this.limits = {};

    // this.grid = DatabaseContainer.getGrid();
    // this.ws = gfs.createWriteStream({
    //     filename: "network:" + campaign._id,
    //     content_type: "json"
    // })

    this.redisClient = DatabaseContainer.getRedis();

    this.ttl = 60 * 10;
}

TwitterRest.prototype = objectAssign({}, TwitterRest.prototype, EventEmitter.prototype, {

    start: function() {
        var sources = this.campaign.sources;
        var targets = this.campaign.targets;

        this.getLimits(function() {
            async.parallel([
                this.getSources.bind(this, sources),
                this.getTargets.bind(this, targets)
                ], function(error) {
                    if (error) throw error;
                    this.emit("completed")
                }.bind(this));
        }.bind(this))
},

    getSources: function(sources, cb) {
        async.each(sources, this.getSourceFollowers.bind(this), function(error) {
            console.log('sources done!')
            cb(error);
        })
    },

    getLimits: function(cb) {
        this.client.get('application/rate_limit_status', {
            resources: 'followers,friends'
        }, function(error, limits, res) {
            if (error) throw error;

            this.limits["/followers/ids"] = limits.resources.followers["/followers/ids"];
            this.limits["/friends/ids"] = limits.resources.friends["/friends/ids"];

             if (cb) cb();        
         }.bind(this));
    },

    // resetLimits: function() {
    //     this.client.get('application/rate_limit_status', {
    //         resources: 'followers,friends'
    //     }, function(error, limits, res) {

    //         _.forEach(limits.resources, function(resource, key) {
    //             this.limits[key] = resource;
    //         }.bind(this));

    //     }.bind(this))    
    // },

    getSourceFollowers: function(source, done) {
        var cursor = -1;
        var count = 0; 

        function getSourceFollower (cb) {

        }

        async.whilst(function() {
            return cursor !== 0 && count++ < 1;
        }.bind(this), function(cb) {
            if (this.limits['/followers/ids'].remaining === 0) {
                var timeout = limit.reset - Math.floor(Date.now() / 1000);

                setTimeout(getLimits, timeout); // get new limits
                return setTimeout(cb, timeout);
            }

            this.limits['/followers/ids'].remaining -= 1;

            this.client.get('followers/ids', { // https://dev.twitter.com/rest/reference/get/followers/ids
                screen_name: source.screen_name,
                count: 5000
            }, function(error, followers, response) {
                if (error) {
                    return cb(error);
                }

                this.writeSourceFollowers(followers.ids, source);

                cursor = followers.next_cursor;

                return cb();
            }.bind(this));
        }.bind(this), function (error) {
            done(error);
        }.bind(this))
    },

    writeSourceFollowers: function(ids, source) {
        // var source_name = source.screen_name
        // var pre = this.campaign._id + ":sourceFollower:"
        // _.forEach(ids, function(id) {
        //     var key = pre + id;
        //     this.redisClient.sadd(key, source_name);
        //     this.redisClient.expire(key, this.ttl)
        // }.bind(this))

        // friends list
        var listKey = this.campaign._id + ":" + source.screen_name + ":followers";

        // set friend->targets
        var source_name = source.screen_name
        var pre = this.campaign._id + ":sourceFollower:"

        _.forEach(ids, function(id) {
            this.redisClient.lpush(listKey, id)
            this.redisClient.expire(listKey, this.ttl)

            var key = pre + id;
            this.redisClient.sadd(key, source_name);
            this.redisClient.expire(key, this.ttl)            
        }.bind(this))

    },

    getTargets: function(targets, cb) {
        async.each(targets, this.getTargetFriends.bind(this), function(error) {
            if (error) throw error;

            console.log('targets done!')
            cb(error);
        })
    },

    getTargetFriends: function(source, done) {
        var cursor = -1;
        var count = 0; 

        async.whilst(function() {
            console.log(this.limits)
            return cursor !== 0 && count++ < 1;
        }.bind(this), function(cb) {
            if (this.limits['/friends/ids'].remaining === 0) {
                var timeout = limit.reset - Math.floor(Date.now() / 1000);
                return setTimeout(cb, timeout);
            }

            this.limits['/friends/ids'].remaining -= 1;
            
            this.client.get('friends/ids', { // https://dev.twitter.com/rest/reference/get/followers/ids
                screen_name: source.screen_name,
                count: 5000
            }, function(error, friends, response) {

                if (error) {
                    return cb(error);
                }

                // console.log('called')
                // console.log(friends)

                this.writeTargetFriends(friends.ids, source);

                cursor = friends.next_cursor;

                return cb();
            }.bind(this));
        }.bind(this), function (error) {
            done(error);
        }.bind(this))
    },

    writeTargetFriends: function(ids, target) {

        // friends list
        var listKey = this.campaign._id + ":" + target.screen_name + ":friends";

        // set friend->targets
        var target_name = target.screen_name
        var pre = this.campaign._id + ":targetFriend:"

        _.forEach(ids, function(id) {
            this.redisClient.lpush(listKey, id)
            this.redisClient.expire(listKey, this.ttl)

            var key = pre + id;
            this.redisClient.sadd(key, target_name);
            this.redisClient.expire(key, this.ttl)            
        }.bind(this))

    }
})

module.exports = TwitterRest;