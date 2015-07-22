var config = require("../config/config")
var Twitter = require('twitter')
var DatabaseContainer = require('../utils/DatabaseContainer')

function TwitterStream(campaign) {
    this.campaign = campaign;
    this.client = new Twitter(config.twitter);
 
    this.redisClient = DatabaseContainer.getRedis();
    this.redisKey = campaign._id + ":tweets"
}


TwitterStream.prototype = {
    track: function(handle) {
        var handle = this.campaign.handle;

        this.client.stream('statuses/filter', {
            track: handle
        }, function(stream) {
            stream.on('data', function(tweet) {
                console.log("got a tweet!")
                this.writeDb(tweet)
            }.bind(this))
            .on('error', function(error) {
                throw error;
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
}

module.exports = TwitterStream; 