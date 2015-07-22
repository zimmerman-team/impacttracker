var socketio = require("socket.io-client");
// var socket = socketio();
var React = require('react')
var Router = require('react-router');
var Login = require('./components/Login.react.jsx');
var Home = require('./components/Home.react.jsx');
// var LoginActions = require('./actions/LoginActions')
var RouterContainer = require('./util/RouterContainer')
var cookie = require('react-cookie')

var App = React.createClass({

    componentDidMount: function() {
        this.listen();
    },

    listen: function() {
        this.socket = socketio();

        this.socket.emit("Source.create", {
            screen_name: "hrw",
            user_id: 14700316
        }, (error, source) => {

            this.socket.emit("Target.create", {
                screen_name: "ggreenwald",
                user_id: 16076032
            }, (error, target) => {
                var campaign = {
                    name: "new campaign",
                    // sources: [
                    //     { screen_name: "hrw" }
                    // ],
                    // targets: [
                    //     { screen_name: "noradio" }
                    // ],
                    sources: [source._id],
                    targets: [target._id],

                    handle: "hrw",
                    description: "description"
                }

                this.socket.emit('Campaign.create', campaign, function(error, data) {
                    console.log(data);
                });
            
            });
        })


    },

    render: function() {
        return (
            <div>
                <h1>App</h1>
                <Router.RouteHandler/>
            </div>
        )   
    }
})

var routes = (
    <Router.Route path="/" handler={App}>
        <Router.Route path="login" handler={Login}/>
        <Router.Route path="home" handler={Home}/>
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

router.run( (Root) => {
    React.render(<Root />, document.body)
    // router.transitionTo('/login')
})