var AppDispatcher = require('../dispatcher/AppDispatcher')
var AuthConstants = require('../constants/AuthConstants')
var RouterContainer = require('../util/RouterContainer')

var LoginActions = {
    loginUser: function(user) {
        RouterContainer.get().transitionTo('/home');

        AppDispatcher.dispatch({
            actionType: AuthConstants.LOGIN_USER,
            user: user
        })
    }
}

module.exports = LoginActions