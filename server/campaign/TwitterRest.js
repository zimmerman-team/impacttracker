var _ = require('lodash')
var async = require('async');
var moment = require('moment')
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
    this.lastLimitUpdate = moment('2014-04-23T09:54:51'); // random historic date

    this.redisClient = DatabaseContainer.getRedis();

    // ttl for redis keys
    this.ttl = 60 * 60 * 24 * 14;
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
                        console.log('done, going to analyse tweets...')
                        this.emit("completed")

                    }.bind(this));
            }.bind(this))
        }.bind(this))
    },

    getLimits: function(cb) {
        var diff = moment().diff(this.lastLimitUpdate, 'seconds')
        if (diff <= 5) return cb()

        this.lastLimitUpdate = moment()

        this.client.get('application/rate_limit_status', {
            resources: 'followers,friends,users'
        }, function(error, limits, res) {
            if (error) console.error(error)
	    if (error) console.error('rate limit exceeded for getting rate limits..');
            if (error) return cb()

            this.limits["/followers/ids"] = limits.resources.followers["/followers/ids"];
            this.limits["/friends/ids"] = limits.resources.friends["/friends/ids"];
            this.limits["/users/lookup"] = limits.resources.users["/users/lookup"];

            console.log('got limits!')
            console.log(this.limits)
            return cb();
         }.bind(this));
    },

    _checkLimits: function(endpoint) {
        if (this.limits[endpoint].remaining < 1) {
	    
            // todo: more efficient timeouts (hard because of having to call API once)
            // var timeout = (this.limits[endpoint].reset - Math.floor(Date.now() / 1000)) * 1000;
            var timeout = 1000 * 60 * 15;
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
                console.log(user.id_str)
                model.update(
                    { screen_name: user.screen_name },
                    { user_id: user.id_str },
                    function(error, doc) {
                        console.log("Fetched a new source or target!")
                        console.log(doc)
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
        async.each(sources, function(source, cb) {
            if (!source.fetched_followers) {
                this.getSourceFollowers(source, cb)
            } else {
                console.log('source ' + source.screen_name + ' already fetched')
                cb()
            }
        }.bind(this), function(error) {
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
            console.log("limit timeout: " + limitTimeout)
            if (limitTimeout > 0)
                return setTimeout(this.getLimits.bind(this, cb), limitTimeout);

            // https://dev.twitter.com/rest/reference/get/followers/ids
            this.client.get('followers/ids', { 
                screen_name: source.screen_name,
                cursor: cursor,
                count: 5000 // this is the maximum per call
            }, function(error, followers, response) {
                // user has a private account
                if (response.code === 401) return cb(error); 
                if (error) console.error(error);
                if (error) return setTimeout(this.getLimits.bind(this, cb), limitTimeout);

                console.log('cursor: ' + cursor)
                this.writeSourceFollowers(followers.ids, source);

                cursor = followers.next_cursor;

                return cb();
            }.bind(this));
        }.bind(this), function (error) {
            if (error) console.error(error)
            if (!error) {
                // mark source as retreived
                console.log("Done fetching source " + source.screen_name)
                source.fetched_followers = true;
                source.save()
            }
            return done()
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
        var listKey = source.screen_name + ":followers";

        console.log('writing source followers')
        var source_id = source.user_id
        var pre = "sourceFollower:"

        if (!source_id) console.error('source user ' + source  + ' is not defined!!');
        if (!source_id) return false

        _.forEach(ids, function(id) {
            // this.redisClient.lpush(listKey, id)
            // this.redisClient.expire(listKey, this.ttl)

            var key = pre + id;

            this.redisClient.sadd(key, source_id);
            // this.redisClient.expire(key, this.ttl)            
        }.bind(this))

    },

    getTargets: function(targets, cb) {
        async.each(targets, function(target, cb) {
            if (!target.fetched_friends) {
                // todo: flush redis before starting
                this.getTargetFriends(target, cb)
            } else {
                console.log('target ' + target.screen_name + ' already fetched')
                cb()
            }
        }.bind(this), function(error) {
            console.log('targets done!')
            cb(error);
        })
    },

    handleUserError: function(error, response) {
        if (response.code === 401) return;
        if (error) return error;
        return;
    },

    /*
     * get Target's friends from the Twitter API
    */
    getTargetFriends: function(target, done) {
        if (!target.screen_name) return done();

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
                screen_name: target.screen_name,
                cursor: cursor,
                count: 5000
            }, function(error, friends, response) {
                if (this.handleUserError(error, response)) return cb(error);

                this.writeTargetFriends(friends.ids, target);

                cursor = friends.next_cursor;

                return cb();
            }.bind(this));
        }.bind(this), function (error) {
            if (error) console.error(error);
            if (!error) {
                // mark target as retreived
                console.log("Done fetching target " + target.screen_name)
                target.fetched_friends = true;
                target.save()
            }
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
        var listKey = target.screen_name + ":friends";

        var target_id = target.user_id
        var pre = "targetFriend:"

        if (!target_id) console.error('target user ' + target + ' is not defined!!');
        if (!target_id) return false

        _.forEach(ids, function(id) {
            // this.redisClient.lpush(listKey, id)
            // this.redisClient.expire(listKey, this.ttl)

            var key = pre + id;
            this.redisClient.sadd(key, target_id);
            // this.redisClient.expire(key, this.ttl)            
        }.bind(this))

    }
})

module.exports = TwitterRest;
