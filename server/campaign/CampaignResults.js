var config = require("../config/config")
var redis = require('redis')
var Q = require('q');
var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var objectAssign = require('object-assign');

function CampaignResults(campaign) {
    this.campaign = campaign;

    this.ttl = 60 * 10;

    this.redisClient = redis.createClient();

    this.tweetList = campaign._id + ":tweets";

    this.graph = {
        directed: false,
        label: campaign.name,
        nodes: [],
        edges: []
    };
}

// CampaignResults.prototype = {
CampaignResults.prototype = objectAssign({}, CampaignResults.prototype, EventEmitter.prototype, {

    start: function(handle) {

        this.redisClient.select(config.redis.db, function(error, res) {
            if (error) throw error;

            this.handleTweet(); 
        }.bind(this))
    },

    isSource: function(userId) {
        return _.some(this.campaign.sources, {'user_id': userId})
    },

    isTarget: function(userId) {
        return _.some(this.campaign.targets, {'user_id': userId})
    },

    addNode: function(user, type) {

        var node = {
            id: user.id_str,
            label: user.screen_name,
            type: type,
            data: {
                user: user
            }
        }

        console.log(node);
        console.log(this.graph.nodes);

        this.graph.nodes.push(node);

        return node;
    },

    addLink: function(tweet, sourceId, targetId) {
        console.log("adding link")
        var link = {
            source: sourceId,
            target: targetId,
            directed: true,
            // label: tweet.text,
            data: {
                tweet: tweet
            }
        }

        this.graph.edges.push(link);

        return link;
    },

    handleTweet: function() {
        this.redisClient.brpop([this.tweetList, 0], function(list, tweet) {

            console.log(this.graph)

            try {
                var tweet = JSON.parse(tweet[1])
            } catch (error) {
                console.error("Failed to parse tweet: ", error.message)
                return this.handleTweet();
            }

            var user = tweet.user;
            var userId = user.id_str;
            console.log("got a tweet from the list with userid", userId)

            var sourceTweet = tweet.retweeted_status;

            var pre = this.campaign._id + ":targetFriend:"

            var sourceFollowerKey = this.campaign._id + ":sourceFollower:" + userId;
            var targetFriendKey = this.campaign._id + ":targetFriend:" + userId;

            if (tweet === "done") {
                console.log("we are done!")
                return this.handleTweet();
            } 

            Q.all([
                Q.ninvoke(this.redisClient, 'smembers', sourceFollowerKey),
                Q.ninvoke(this.redisClient, 'smembers', targetFriendKey)
            ]).then(function(data) {
                var sources = data[0];
                var targets = data[1];
                var isSource = this.isSource(userId);
                var isTarget = this.isTarget(userId);

                console.log("got sourceFollowers and targetFriends!")
                console.log(sources);
                console.log(targets);


                if (sourceTweet) {
                    console.log("tweet is a retweet!")
                    // console.log(tweet.text)
                    // console.log(sourceTweet.text)


                    var sourceTweetUser = sourceTweet.user;
                    var sourceTweetIsSource = this.isSource(sourceTweetUser.id_str);
                    var sourceTweetIsTarget = this.isTarget(sourceTweetUser.id_str);

                    console.log(sourceTweet.user.screen_name)
                    console.log(sourceTweetIsSource)

                    if (sourceTweetIsSource) {
                        console.log(isSource);
                        console.log(isTarget);
                        console.log(targets);

                        var links = [];
                        var nodes = [];


                        if (isSource) { // source -> source link
                            console.log('called source')
                            this.emit("new-link", this.addLink(tweet, sourceTweetUser.id, userId));

                            return this.handleTweet();
                        }

                        if (isTarget) { // source -> target
                            console.log('called target')
                            this.emit("new-link", this.addLink(tweet, sourceTweetUser.id, userId));

                            return this.handleTweet();
                        }

                        if (sources.length && targets.length) { // intermediate user
                        // if (targets.length > 0) { // retweet user followed by target
                            console.log('called targets')
                            this.emit("new-node", this.addNode(user, "intermediate"));
                            this.emit("new-link", this.addLink(tweet, sourceTweetUser.id, userId));

                            _.forEach(targets, function(target) {
                                this.emit("new-link", this.addLink(null, userId, target));
                            })
                         
                            return this.handleTweet();
                        } 


                        // otherwise, unrelated user
                        console.log('before node')
                        this.emit("new-node", this.addNode(user, "unrelated"));
                        console.log('after node')
                        this.emit("new-link", this.addLink(tweet, sourceTweetUser.id, userId));
                        console.log('after link')

                        return this.handleTweet();
                    }

                    // var mainSourceFollowerKey = this.campaign._id + ":sourceFollower:" + sourceTweetUser.id_str;
                    // var mainTargetFriendKey = this.campaign._id + ":targetFriend:" + sourceTweetUser.id_str;

                    // Q.all([
                    //     Q.ninvoke(this.redisClient, 'smember', mainSourceFollowerKey),
                    //     Q.ninvoke(this.redisClient, 'smember', mainTargetFriendKey)
                    // ]).then(function(data) {
                    //     var sourceTweetSources = data[0];
                    //     var sourceTweetTargets = data[1];

                    // }).catch(function(error) {
                    //     throw error;
                    // })                 
                }

                return this.handleTweet();

            }.bind(this))
            .catch(function(error) {
                throw error;
            }.bind(this))


        }.bind(this))
    }
});

module.exports = CampaignResults; 