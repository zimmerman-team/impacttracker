var config = require("../config/config")
var redis = require('redis')
var Q = require('q');
var _ = require('lodash');

function CampaignCategorization(campaign) {
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

CampaignCategorization.prototype = {
    start: function(handle) {

        this.redisClient.select(config.redis.db, function(error, res) {
            if (error) throw error;

            this.handleTweet(); 
        }.bind(this))
    },

    isSource: function(userId) {
        _.some(this.campaign.sources, {'user_id': userId})
    },

    isTarget: function(userId) {
        _.some(this.campaign.targets, {'user_id': userId})
    },

    addNode: function(user, type) {
        this.graph.nodes.push({
            id: user.userId,
            label: user.screen_name,
            type: type,
            data: {
                user: user
            }
        })
    },

    addLink: function(tweet, sourceId, targetId) {
        this.graph.links.push({
            source: sourceId,
            target: targetId,
            directed: true,
            // label: tweet.text,
            data: {
                tweet: tweet
            }
        })
    }

    handleTweet: function() {
        this.redisClient.brpop([this.tweetList, 0], function(list, tweet) {
            console.log("got a tweet from the list!")

            console.log(this.graph)

            try {
                var tweet = JSON.parse(tweet[1])
            } catch (error) {
                console.error("Failed to parse tweet: ", error.message)
                return this.handleTweet();
            }
            console.log(tweet);

            var user = tweet.user;
            var userId = user.id;

            var sourceTweet = user.retweeted_status;

            var pre = this.campaign._id + ":targetFriend:"

            var sourceFollowerKey = this.campaign._id + ":sourceFollower:" + userId;
            var targetFriendKey = this.campaign._id + ":targetFriend:" + userId;

            if (tweet === "done") {
                console.log("we are done!")
                return;
            } 

            Q.all([
                Q.ninvoke(this.redisClient, 'smember', sourceFollowerKey),
                Q.ninvoke(this.redisClient, 'smember', targetFriendKey)
            ]).then(function(data) {
                var sources = data[0];
                var targets = data[1];
                var isSource = this.isSource(userId);
                var isTarget = this.isTarget(userId);

                if (sourceTweet) {
                    var sourceTweetUser = sourceTweet.user;
                    var sourceTweetUserId = sourceTweetUser.id;
                    var sourceTweetIsSource = this.isSource(sourceTweetUserId);
                    var sourceTweetIsTarget = this.isTarget(sourceTweetUserId);

                    if (sourceTweetIsSource) {
                        if (isSource) { // source -> source link
                            this.addLink(tweet, sourceTweetUserId, userId);
                            return this.handleTweet();
                        }

                        if (isTarget) { // source -> target
                            this.addLink(tweet, sourceTweetUserId, userId);

                            return this.handleTweet();
                        }

                        if (targets) { // retweet user followed by target
                            this.addNode(user, "intermediate")
                            this.addLink(tweet, sourceTweetUserId, userId);

                            _.forEach(targets, function(target) {
                                this.addLink(tweet, userId, target);
                            })
                         
                            return this.handleTweet();
                        } 

                        // otherwise, unrelated user
                        this.addNode(user, "unrelated");
                        this.addLink(tweet, sourceTweetUserId, userId);
                  
                        return this.handleTweet();
                    }

                    // var mainSourceFollowerKey = this.campaign._id + ":sourceFollower:" + sourceTweetUser.id;
                    // var mainTargetFriendKey = this.campaign._id + ":targetFriend:" + sourceTweetUser.id;

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
}

module.exports = CampaignCategorization; 