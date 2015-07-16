var objectAssign = require('object-assign')
var EventEmitter = require('events').EventEmitter;
var CHANGE_EVENT = 'change';

var BaseStore = objectAssign({}, EventEmitter.prototype, {

    emitChange: function() {
        this.emit(CHANGE_EVENT);
    },

    addChangeListener: function(cb) {
        this.on(CHANGE_EVENT, cb);
    },

    removeChangeListener: function(cb) {
        this.removeListener(CHANGE_EVENT, cb);
    }
})

module.exports = BaseStore