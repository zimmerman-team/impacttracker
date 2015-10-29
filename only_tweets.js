
var TwitterStream = require('./server/campaign/TwitterStream')
var Campaign = require('./server/models/campaign');
var TwitterAccount = require('./server/models/twitterAccount');
var redis = require('redis');
var mongoose = require("mongoose");
var ObjectId = require('mongoose').Types.ObjectId; 
var config = require('./server/config/config')
var DatabaseContainer = require('./server/utils/DatabaseContainer')

mongoose.connect(config.database.url, function(err) {
    console.log('caled mongoose callback')

    redisClient = redis.createClient();

    redisClient.select(config.redis.db, function(error, res) {
        if (error) throw error;

        DatabaseContainer.setRedis(redisClient);

        var campaign = new Campaign({
            name: "Volleyball",
            author: new ObjectId('55ba3fb4c4f29ed665097c64'),
            handle: 'Watch4Women',
            description: "",
            running: true
        });
        campaign.save(function(error, campaign) {
            Campaign.findOnePopulated({_id: new ObjectId(campaign._id)}, function(err, campaign) {
                console.log(campaign)
                console.log('wrote campaign with id ' + campaign._id)

                twitterStream = new TwitterStream(campaign); 
                twitterStream.track()
                console.log('writing tweets to redis...')
            })
        })
    })
})
