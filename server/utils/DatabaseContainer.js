
var _db = null;
var _grid = null;

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
    }
}

module.exports = DatabaseContainer;