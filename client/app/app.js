// var socket = socketio();
var React = require('react')
var Router = require('react-router');

// var LoginActions = require('./actions/LoginActions')
var RouterContainer = require('./util/RouterContainer')
var cookie = require('react-cookie')


var App = React.createClass({

    render: function() {
        return (
            <div>
                <h1>sadasd</h1>
                <Router.RouteHandler/>
            </div>
        )   
    }
})

var Login = require('./components/Login.react.jsx');
var Home = require('./components/Home.react.jsx');
var Campaign = require('./components/Campaign.react.jsx');

var routes = (
    <Router.Route path="/" handler={App}>
        <Router.Route path="login" handler={Login}/>
        <Router.Route path="home" handler={Home}>
            <Router.Route path="campaign" handler={Campaign} />
        </Router.Route>
    </Router.Route>
)

// push state mode
var router = Router.create({
    routes: routes,
    location: Router.HistoryLocation
});

// hashbang mode
var router = Router.create({
    routes: routes
});

RouterContainer.set(router);

document.addEventListener('DOMContentLoaded', function () {
    router.run( (Root) => {
        React.render(<Root />, document.getElementById("app"))
        // router.transitionTo('/login')
    })
});