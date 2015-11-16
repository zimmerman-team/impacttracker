
var redis = require('redis');
var sys = require('sys')
const _ = require('lodash');
const exec = require('child_process').exec;
redisClient = redis.createClient();

redisClient.select(0, function(error, res) {
    if (error) throw error;

    var list = process.argv[2]
    if (!list) throw "provide a list"
    var temp_list = "temp_list_test"

    redisClient.del(temp_list, function(error, res) {

        exec("cat tweets.txt | head -c-1 | redis-cli -x restore " + temp_list + " 0", function(error, stdout, stderr) {
            console.log("stdout: " + stdout);

            redisClient.lrange(temp_list, 0, -1, function(error, res) {
                if (error) throw error;
                _.forEach(res, function(tweet) {
                    redisClient.lpush(list, tweet);
                })
            })
        })
    })
})


