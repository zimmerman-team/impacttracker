var config = require("../config/config")
var Twitter = require('twitter')
var objectAssign = require('object-assign')
var EventEmitter = require('events').EventEmitter
var DatabaseContainer = require('../utils/DatabaseContainer')

function TwitterStream(campaign) {
    this.campaign = campaign;
    this.client = new Twitter(config.twitter);
 
    this.redisClient = DatabaseContainer.getRedis();
    this.redisKey = campaign._id + ":tweets"
}

var _stopped = false;

TwitterStream.prototype = objectAssign({}, TwitterStream.prototype, EventEmitter.prototype, {
    track: function(handle) {
        var handle = this.campaign.handle;



        function handleTweet(tweet) {
            this.writeDb(tweet)
        }

        this.client.stream('statuses/filter', {
            track: handle
        }, function(stream) {
            stream
                .on('data', handleTweet.bind(this))
                .on('error', function(error) {
                    throw error;
                })

            this.once("stop", function() {
                stream.removeAllListeners();
            })

        }.bind(this))
        // _client.stream('statuses/sample', {}
        //     , function(stream) {
        //     stream.on('data', function(tweet) {
        //         console.log(tweet);
        //     })
        //     .on('error', function(error) {
        //         console.error(error)
        //     })
        // })
    },

    writeDb: function(tweet) {
        console.log("writing to", this.redisKey)
        this.redisClient.lpush(this.redisKey, JSON.stringify(tweet));

        // var pre = this.campaign._id + ":tweet:" + tweet.id
        // _.forEach(ids, function(id) {
        //     var key = pre + id;
        //     this.redisClient.sadd(key, source_name);
        //     this.redisClient.expire(key, this.ttl)
        // }.bind(this))
        // console.log(tweet);
    }
})

module.exports = TwitterStream; 