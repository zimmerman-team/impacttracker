var config = require("../config/config")
var Twitter = require('twitter')

function TwitterStream(campaign) {
    this.campaign = campaign;
    this.client = new Twitter(config.twitter);
}

TwitterStream.prototype = {
    track: function(handle) {
        var handle = this.campaign.handle;

        this.client.stream('statuses/filter', {
            track: handle
        }, function(stream) {
            stream.on('data', function(tweet) {
                this.writeDb(tweet)
                // console.log(tweet);
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
        console.log(tweet);
    }
}

module.exports = TwitterStream; 