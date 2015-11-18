var config = require("../config/config")
var redis = require('redis')
var Q = require('q');
var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var objectAssign = require('object-assign');
var moment = require("moment")

var DatabaseContainer = require('../utils/DatabaseContainer')
var Campaign = require('../models/campaign')

function CampaignResults(campaign) {
    this.campaign = campaign;

    this.ttl = 60 * 10;

    this.redisClient = redis.createClient();
    this.database = DatabaseContainer.getDb()

    this.tweetList = campaign._id + ":tweets";

    this.graph = campaign.networkGraph || {
        directed: false,
        label: campaign.name,
        nodes: [],
        edges: []
    };

    this.lineGraph = campaign.lineGraph || [];

    this.stopped = false;
}

// CampaignResults.prototype = {
CampaignResults.prototype = objectAssign({}, CampaignResults.prototype, EventEmitter.prototype, {

    start: function(resume) {

        // initialize source and target nodes
        // _.forEach(this.campaign.sources, function(source) {
        //     this.addNode(source.toObject(), "source")
        // }.bind(this))

        _.forEach(this.campaign.targets, function(target) {
            this.addNode(target.toObject(), "target")
        }.bind(this))

        // // write initial graphs to database
        this.writeDb()

        this.redisClient.select(config.redis.db, function(error, res) {
            if (error) throw error;

            this.handleTweet(); 
        }.bind(this))

        this.once("stop", function() {
            console.log('called stop, pushing stop to redis')
            this.redisClient.lpush(this.tweetList, "stop");
        }.bind(this))

        console.log("listening for tweets on " + this.tweetList);

    },

    getSource: function(userId) {
        return _.find(this.campaign.sources, {'user_id': userId})
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

        console.log('adding node...')
        console.log(user)

        var node = {
            id: user.id_str || user.user_id, // TODO: change all to id_str
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
        console.log('adding tweet..')
        // var date = moment(new Date(tweet.created_at)).startOf('minute').format('x');

        var item = {
            // date: date,
            tweet: tweet,
            layer: layer
        }

        this.lineGraph.push(item)

        // this.lineGraph[date] = this.lineGraph[date] || {};
        // this.lineGraph[date][layer] = this.lineGraph[date][layer] || [];
        // this.lineGraph[date][layer].push(tweet);

        return item;
    },

    writeGraphRedis: function() { // write graph to redis for real-time results
        this.redisClient.set(this.campaign._id + ":graph", JSON.stringify(this.graph))
        this.redisClient.set(this.campaign._id + ":linegraph", JSON.stringify(this.lineGraph))
    },

    writeDb: function() {
        Campaign.findByIdAndUpdate(this.campaign._id, {
            networkGraph: this.graph,
            lineGraph: this.lineGraph
        }, function(error, doc) {
            if (error) console.error(error)
        })
    },

    /*
     * Updates the graph and emits relevant events
    */
    handleNewTweet: function(tweet, original_tweet, category) {
        // if (_.find(this.sources, jj))
        this.emit("new-link", this.addLink(tweet, original_tweet.user.id_str, tweet.user.id_str));
        this.emit("new-tweet", this.addTweet(tweet, category));
    },

    getTwitterIdFromScreenName: function(screenName, cb) {
        this.database.findByScreenName({}, screenName, function(error, source) {
            if (error) return cb()

        })
    },

    /*
     * This is a blocking call, waiting for new tweets (blocks redis connection)
    */
    handleTweet: function() {
        this.redisClient.brpop([this.tweetList, 0], function(list, tweet) {
            
            // stop event emitted by Campaign, write graphs to database
            if (tweet === "stop") {
                console.log('called writedb')
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

            var userId = user.id_str;

            // the originally retweeted tweet, we are only interested in retweets
            var original_tweet = tweet.retweeted_status;
            if (!original_tweet) return this.handleTweet()

            var sourceFollowerKey = ":sourceFollower:" + userId;
            var targetFriendKey = ":targetFriend:" + userId;

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

                var original_tweet_is_source = this.isSource(original_tweet.user.id_str);
                var original_tweet_is_target = this.isTarget(original_tweet.user.id_str);

                console.log("tweet is source? " + original_tweet_is_source)

                // we only care when the retweeted tweet is tweeted by a a source
                if (original_tweet_is_source) {

                    // add source node if not added already
                    var source = this.getSource(original_tweet.user.id_str)
                    if (!source.hasLinks) {
                        this.emit("new-node", this.addNode(source.toObject(), "source"));
                        source.hasLinks = true;
                    }

                    // source -> source
                    if (isSource) { 
                        console.info("Got a new source->source relation")
                        this.handleNewTweet(tweet, original_tweet, "source")
                    }
                    // source -> target
                    else if (isTarget) { // source -> target
                        console.info("Got a new source->target relation")
                        this.handleNewTweet(tweet, original_tweet, "target")
                    }
                    // source -> intermediate
                    // intermediate -> target(s)
                    else if (targets.length) { // intermediate user
                        console.info("Got a new source->intermediate and intermediate->targets relation")
                        this.emit("new-node", this.addNode(user, "intermediate"));
                        this.handleNewTweet(tweet, original_tweet, "intermediate")

                        _.forEach(targets, function(target) {
                            this.emit("new-link", this.addLink(null, userId, target));
                        }.bind(this))
                    } 
                    // source -> unrelated
                    else {
                        console.info("Got a new source->unrelated relation")
                        this.emit("new-node", this.addNode(user, "unrelated"));
                        this.handleNewTweet(tweet, original_tweet, "unrelated")
                    }

                }

                // this.writeDb();
                this.writeGraphRedis()
                return this.handleTweet();

            }.bind(this))
            .catch(function(error) {
                console.error(error)

                return this.handleTweet();
            }.bind(this))
        }.bind(this))
    }
});

module.exports = CampaignResults; 
