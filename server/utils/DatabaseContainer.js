
var _db = null;
var _grid = null;
var _redis = null;

var DatabaseContainer = {
    getDb: function() {
        return _db;
    },

    setDb: function(db) {
        _db = db;
    },

    getGrid: function() {
        return _grid;
    },

    setGrid: function(grid) {
        _grid = grid;
    },

    setRedis: function(redisClient) {
        _redis = redisClient;
    },

    getRedis: function() {
        return _redis;
    }
}

module.exports = DatabaseContainer;