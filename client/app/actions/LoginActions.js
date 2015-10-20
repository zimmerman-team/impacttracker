var AppDispatcher = require('../dispatcher/AppDispatcher')
var AuthConstants = require('../constants/AuthConstants')
var RouterContainer = require('../util/RouterContainer')

var LoginActions = {
    loginUser: function(user) {
        // temporary solution
        localStorage.setItem('isLoggedIn', true)

        RouterContainer.get().transitionTo('/home/campaign');


        AppDispatcher.dispatch({
            actionType: AuthConstants.LOGIN_USER,
            user: user
        })
    },

    logoutUser: function() {
        localStorage.setItem('isLoggedIn', false)

        RouterContainer.get().transitionTo('/login');


        AppDispatcher.dispatch({
            actionType: AuthConstants.LOGOUT_USER
        })
    }
}

module.exports = LoginActions
