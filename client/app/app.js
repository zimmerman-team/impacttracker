// var socket = socketio();
var React = require('react')
var Router = require('react-router');

// var LoginActions = require('./actions/LoginActions')
var RouterContainer = require('./util/RouterContainer')
var cookie = require('react-cookie')

var LoginActions = require("./actions/LoginActions")

// var loggedIn = localStorage.getItem('logged_in')
// if (loggedIn) {
//   LoginActions.loginUser(loggedIn)
// }

// console.log(loggedIn)

var App = React.createClass({
    render: function() {
        return (
            <div>
                <Router.RouteHandler/>
            </div>
        )   
    }
})

var Login = require('./components/Login.react');
var Home = require('./components/Home.react');
var Campaign = require('./components/Campaign.react');
var CampaignDetail = require('./components/CampaignDetail.react');
var CampaignView = require('./components/CampaignView.react');

var NotFound = React.createClass({
    render: function() {
        return (
        <h1>Not found!</h1>
        )
    }
})

var routes = (
    <Router.Route path="/" handler={App}>

        <Router.DefaultRoute handler={Home}/>

        <Router.Route path="login" handler={Login}/>
        <Router.Route path="home" handler={Home}>
            <Router.Route path="campaign" handler={Campaign} />
            <Router.Route path="campaign/:id" handler={CampaignDetail} />
            <Router.Route path="campaign/view/:id" handler={CampaignView} />
        </Router.Route>
        <Router.NotFoundRoute handler={NotFound} />
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