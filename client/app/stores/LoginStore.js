var objectAssign = require('object-assign')
var AuthConstants = require("../constants/AuthConstants")
var BaseStore = require("./BaseStore")
var AppDispatcher = require('../dispatcher/AppDispatcher');
var AuthService = require('../services/AuthService')

var _user = null;

var LoginStore = objectAssign({}, BaseStore, {
    dispatcherIndex: AppDispatcher.register(function(action) {

        switch(action.actionType) {
            case AuthConstants.LOGIN_USER:
                _user = action.user;

                LoginStore.emitChange();
                break;

            case AuthConstants.LOGOUT_USER:
                _user = null;

                LoginStore.emitChange();
                break;
        }
    }),

    getUser: function() {
        return _user;
    },

    isLoggedIn: function() {
        return !!_user;
    },

    componentDidMount: function() {
        _user = window.user
    }
})

module.exports = LoginStore
