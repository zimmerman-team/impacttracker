var objectAssign = require('object-assign')
var AuthConstants = require("../constants/AuthConstants")
var BaseStore = require("./BaseStore")
var AppDispatcher = require('../dispatcher/AppDispatcher');

var _user = null;

var LoginStore = objectAssign({}, BaseStore, {
    dispatcherIndex: AppDispatcher.register(function(action) {

        switch(action.actionType) {
            case AuthConstants.LOGIN_USER:
                _user = action.user;

                LoginStore.emitChange();
                break;
        }
    }),

    getUser: function() {
        return _user;
    },

    isLoggedIn: function() {
        return !!_user;
    }
})

module.exports = LoginStore