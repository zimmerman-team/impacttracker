var config = require("../config/config")
var redis = require('redis')
var Q = require('q');
var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var objectAssign = require('object-assign');
var moment = require("moment")

var DatabaseContainer = require('../utils/DatabaseContainer')
var Campaign = require('../api/Campaign')

function CampaignResults(campaign) {
    this.campaign = campaign;

    this.ttl = 60 * 10;

    this.redisClient = redis.createClient();
    this.database = DatabaseContainer.getDb()

    this.tweetList = campaign._id + ":tweets";

    this.graph = {
        directed: false,
        label: campaign.name,
        nodes: [],
        edges: []
    };

    this.lineGraph = {};

    this.stopped = false;
}

// CampaignResults.prototype = {
CampaignResults.prototype = objectAssign({}, CampaignResults.prototype, EventEmitter.prototype, {

    start: function(handle) {

        // initialize source and target nodes
        _.forEach(this.campaign.sources, function(source) {
            this.addNode(source, "source")
        }.bind(this))

        _.forEach(this.campaign.targets, function(target) {
            this.addNode(target, "target")
        }.bind(this))

        this.redisClient.select(config.redis.db, function(error, res) {
            if (error) throw error;

            this.writeGraphRedis();
            this.handleTweet(); 
        }.bind(this))

        this.once("stop", function() {
            this.redisClient.lpush(this.tweetList, "stop");
        }.bind(this))

    },

    isSource: function(userId) {
        return _.some(this.campaign.sources, {'user_id': userId})
    },

    isTarget: function(userId) {
        return _.some(this.campaign.targets, {'user_id': userId})
    },

    getGraph: function(cb) {
        return this.graph;
    },

    addNode: function(user, layer) {

        var node = {
            id: user.id_str || user.user_id, // todo: change all to id_str
            label: user.screen_name,
            layer: layer,
            data: {
                user: user
            }
        }

        this.graph.nodes.push(node);

        return node;
    },

    addLink: function(tweet, sourceId, targetId) {
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

    addTweet: function(tweet, layer) {
        var date = moment(Date(tweet.created_at)).startOf('minute').format('x');

        var item = {
            date: date,
            tweet: tweet,
            layer: layer
        }

        this.lineGraph[date] = this.lineGraph[date] || {};
        this.lineGraph[date][layer] = this.lineGraph[date][layer] || [];
        this.lineGraph[date][layer].push(tweet);

        return item;
    },

    writeGraphRedis: function() { // write graph to redis for real-time results
        console.log(this.lineGraph)
        this.redisClient.set(this.campaign._id + ":graph", JSON.stringify(this.graph))
        this.redisClient.set(this.campaign._id + ":linegraph", JSON.stringify(this.lineGraph))
    },

    writeDb: function() {
        Campaign.findByIdAndUpdate(this.campaign._id, {
            networkGraph: this.graph,
            lineGraph: this.lineGraph
        })
    },

    /*
     * Updates the graph and emits relevant events
    */
    handleNewTweet: function(tweet, original_tweet, category) {
        this.emit("new-link", this.addLink(tweet, original_tweet.user.id_str, tweet.user.id_str;));
        this.emit("new-tweet", this.addTweet(tweet, category"));

        this.writeGraphRedis();

    }

    /*
     * This is a blocking call, waiting for new tweets (blocks redis connection)
    */
    handleTweet: function() {
        this.redisClient.brpop([this.tweetList, 0], function(list, tweet) {
            
            // stop event emitted by Campaign, write graphs to database
            if (tweet === "stop") {
                return this.writeDb(); 
            }

            try {
                var tweet = JSON.parse(tweet[1])
            } catch (error) {
                console.error("Failed to parse tweet: ", error.message)
                return this.handleTweet();
            }

            var user = tweet.user;
            if (!user) { return this.handleTweet(); }

            var sourceFollowerKey = this.campaign._id + ":sourceFollower:" + userId;
            var targetFriendKey = this.campaign._id + ":targetFriend:" + userId;

            var userId = user.id_str;

            // the originally retweeted tweet, we are only interested in retweets
            var original_tweet = tweet.retweeted_status;
            if (!orignal_tweet) return this.handleTweet()

            var sourceFollowerKey = this.campaign._id + ":sourceFollower:" + userId;
            var targetFriendKey = this.campaign._id + ":targetFriend:" + userId;

            /*
             * Check if the source is a follower of a friend and/or a friend of a target
             * Handle the different cases accordingly
            */
            Q.all([
                Q.ninvoke(this.redisClient, 'smembers', sourceFollowerKey),
                Q.ninvoke(this.redisClient, 'smembers', targetFriendKey)
            ]).then(function(data) {
                var sources = data[0];
                var targets = data[1];

                // is the retweeter a source or a target?
                var isSource = this.isSource(userId);
                var isTarget = this.isTarget(userId);

                console.log("got sourceFollowers and targetFriends!")

                var original_tweet_user = original_tweet.user;
                var original_tweet_is_source = this.isSource(original_tweet.user.id_str);
                var original_tweet_is_target = this.isTarget(original_tweet.user.id_str);

                // we only care when the retweeted tweet is tweeted by a a source
                if (original_tweet_is_source) {

                    // source -> source
                    if (isSource) { 
                        handleNewTweet(tweet, original_tweet, "source")
                    }
                    // source -> target
                    else if (isTarget) { // source -> target
                        handleNewTweet(tweet, original_tweet, "target")
                    }
                    // source -> intermediate
                    // intermediate -> target(s)
                    else if (targets.length) { // intermediate user
                        this.emit("new-node", this.addNode(user, "intermediate"));
                        handleNewTweet(tweet, original_tweet, "intermediate")

                        _.forEach(targets, function(target) {
                            this.emit("new-link", this.addLink(null, userId, target));
                        })
                    } 
                    // source -> unrelated
                    else {
                        // otherwise, unrelated user
                        this.emit("new-node", this.addNode(user, "unrelated"));
                        handleNewTweet(tweet, original_tweet, "unrelated")
                    }
                }

            return this.handleTweet();

            }
        }.bind(this))
        .catch(function(error) {
            throw error;
        }.bind(this))
    }
});

module.exports = CampaignResults; 
