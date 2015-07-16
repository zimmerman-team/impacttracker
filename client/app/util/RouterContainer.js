
var _router = null; // set on app initialization

var RouterContainer = {
    get: function() {
        return _router;
    },
    
    set: function(router) {
        _router = router;
    }
}

module.exports = RouterContainer