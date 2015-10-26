var _ = require('lodash')
var async = require('async');
var config = require("../config/config")
var Twitter = require('twitter')
var EventEmitter = require('events').EventEmitter
var objectAssign = require('object-assign')
var DatabaseContainer = require('../utils/DatabaseContainer')

var Source = require('../models/source')
var Target = require('../models/target')

var Campaign = require('../models/campaign')

function TwitterRest(campaign) {
    this.campaign = campaign;

    this.twitterConfig = config.twitter;
    this.twitterConfig.access_token_key = campaign.author.access_token;
    this.twitterConfig.access_token_secret = campaign.author.access_token_secret;
    this.client = new Twitter(this.twitterConfig);

    this.limits = {};

    this.redisClient = DatabaseContainer.getRedis();

    // ttl for redis keys
    this.ttl = 60 * 10;
}

TwitterRest.prototype = objectAssign({}, TwitterRest.prototype, EventEmitter.prototype, {

    /*
     * 1. Get API limits from Twitter API
     * 2. Retreive users profiles for the designated sources, targets from Twitter API
     * 3. get Sources and followers of the designated sources/targets from Twitter API
    */
    start: function() {
        var sources = this.campaign.sources;
        var targets = this.campaign.targets;

        this.getLimits(function() {
            this.getSourceTargetUsers(sources, targets, function(sources, targets) {
                async.parallel([
                    this.getSources.bind(this, sources),
                    this.getTargets.bind(this, targets)
                    ], function(error) {
                        if (error) console.error(error)

                        // DONE, emit completed
                        this.emit("completed")

                    }.bind(this));
            }.bind(this))
        }.bind(this))
    },

    getLimits: function(cb) {
        this.client.get('application/rate_limit_status', {
            resources: 'followers,friends,users'
        }, function(error, limits, res) {
            if (error) console.error(error)

            console.log('got limits!')

            this.limits["/followers/ids"] = limits.resources.followers["/followers/ids"];
            this.limits["/friends/ids"] = limits.resources.friends["/friends/ids"];
            this.limits["/users/lookup"] = limits.resources.users["/users/lookup"];

            console.log(this.limits)
             if (cb) cb();
         }.bind(this));
    },

    _checkLimits: function(endpoint) {
        if (this.limits[endpoint].remaining <= 1) {
            var timeout = (this.limits[endpoint].reset - Math.floor(Date.now() / 1000)) * 1000;
            this.limits[endpoint].remaining -= 1;
            return timeout
        } else {
            this.limits[endpoint].remaining -= 1;
            return 0
        }
    },

    /*
     * Parses error response returned by Twitter API
     * TODO: make this handle more cases
    */
    _parseTwitterErrorMessage: function(error) {
        errorRes = error[0]; // assume one error message for now
        return errorRes.code + ": " + errorRes.message;
    },

    // given user objects, return full twitter profiles, with twitter API
    _performUserLookup: function(model, users, cb) {

        limitTimeout = this._checkLimits('/users/lookup')
        if (limitTimeout > 0)
                return setTimeout(this.getLimits.bind(this, cb), limitTimeout);

        this.client.get('/users/lookup', {
            screen_name: users
        }, function(error, twitterUsers, response) {
            if (error) console.error(this._parseTwitterErrorMessage(error));
            if (error) return cb("failed to get any user in list " + users);

            // update model with retreived id
            async.each(twitterUsers, function(user, updatedcb) {
                model.update(
                    { screen_name: user.screen_name },
                    { user_id: user.id_str },
                    function(error, doc) {
                        updatedcb(error)
                });
            }, function(error) {
                if (error) console.error(error)
                console.log("done fetching users")
                cb();

            })
        }.bind(this));
    },

    getSourceTargetUsers: function(sources, targets, done) {
        var sourceScreenNames = _.pluck(sources, "screen_name").join();
        var targetScreenNames = _.pluck(targets, "screen_name").join();
        console.log(sourceScreenNames);
        console.log(targetScreenNames);
        getSources = this._performUserLookup.bind(this, Source, sourceScreenNames);
        getTargets = this._performUserLookup.bind(this, Target, targetScreenNames);

        async.parallel([
                getSources,
                getTargets,
            ], function(error) {
                if (error) console.error(error);

                console.log("getting campaign...")

                // fetch campaign again, with updated sources, targets
                Campaign.findOnePopulated({_id: this.campaign._id},
                    function(error, campaign) {
                        if (error) console.error(error)
                        console.log(campaign);
                        done(campaign.sources, campaign.targets);

                    }.bind(this))
            }.bind(this))
    },


    getSources: function(sources, cb) {
        async.each(sources, this.getSourceFollowers.bind(this), function(error) {
            console.log('sources done!')
            cb(error);
        })
    },

    /*
     * get source's followers from the Twitter API
    */
    getSourceFollowers: function(source, done) {

        // shouldnt happen, but can't be sure
        if (!source.screen_name) return done();

        var cursor = -1;
        // var count = 0; 

        async.whilst(function() {
            return cursor !== 0;
        }, function(cb) {

            limitTimeout = this._checkLimits('/followers/ids')
            console.log("limit timeout: ")
            console.log(limitTimeout)
            if (limitTimeout > 0)
                return setTimeout(this.getLimits.bind(this, cb), limitTimeout);

            // https://dev.twitter.com/rest/reference/get/followers/ids
            this.client.get('followers/ids', { 
                screen_name: source.screen_name,
                count: 5000 // this is the maximum per call
            }, function(error, followers, response) {
                if (error) console.error(error);
                if (error) return setTimeout(this.getLimits.bind(this, cb), limitTimeout);

                this.writeSourceFollowers(followers.ids, source);

                cursor = followers.next_cursor;

                return cb();
            }.bind(this));
        }.bind(this), function (error) {
            if (error) console.error(error)
            done()
        }.bind(this))
    },


    /*
     * Write source followers of {source} to redis.
     * 1. followers of source to a list
     * 2. per follower, a set of sources that they follow
     * CampaignResults uses these to determine relations
    */
    writeSourceFollowers: function(ids, source) {
        // friends list
        var listKey = this.campaign._id + ":" + source.screen_name + ":followers";

        console.log('writing source followers')
        var source_id = source.user_id
        var pre = this.campaign._id + ":sourceFollower:"

        if (!source_id) return false

        _.forEach(ids, function(id) {
            this.redisClient.lpush(listKey, id)
            this.redisClient.expire(listKey, this.ttl)

            var key = pre + id;
            console.log(source_id);
            this.redisClient.sadd(key, source_id);
            this.redisClient.expire(key, this.ttl)            
        }.bind(this))

    },

    getTargets: function(targets, cb) {
        async.each(targets, this.getTargetFriends.bind(this), function(error) {
            console.log('targets done!')
            cb(error);
        })
    },

    /*
     * get Target's friends from the Twitter API
    */
    getTargetFriends: function(source, done) {
        if (!source.screen_name) return done();

        var cursor = -1;
        // var count = 0; 

        async.whilst(function() {
            return cursor !== 0;
        }.bind(this), function(cb) {

            limitTimeout = this._checkLimits('/friends/ids')
            if (limitTimeout > 0)
                return setTimeout(this.getLimits.bind(this, cb), limitTimeout);

            // https://dev.twitter.com/rest/reference/get/followers/ids
            this.client.get('friends/ids', { 
                screen_name: source.screen_name,
                count: 5000
            }, function(error, friends, response) {
                if (error) return cb(error)

                this.writeTargetFriends(friends.ids, source);

                cursor = friends.next_cursor;

                return cb();
            }.bind(this));
        }.bind(this), function (error) {
            done(error);
        })
    },

    /*
     * Write target fiends of {target} to redis.
     * 1. followers of target to a list
     * 2. per follower, a set of targets that they follow (once per iteration)
     * CampaignResults uses these to determine relations
    */
    writeTargetFriends: function(ids, target) {

        // friends list
        var listKey = this.campaign._id + ":" + target.screen_name + ":friends";

        var target_id = target.user_id
        var pre = this.campaign._id + ":targetFriend:"

        _.forEach(ids, function(id) {
            this.redisClient.lpush(listKey, id)
            this.redisClient.expire(listKey, this.ttl)

            var key = pre + id;
            this.redisClient.sadd(key, target_id);
            this.redisClient.expire(key, this.ttl)            
        }.bind(this))

    }
})

module.exports = TwitterRest;
