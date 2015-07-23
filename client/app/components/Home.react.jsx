var React = require('react')
var Router = require('react-router');
var socketio = require("socket.io-client");

var Authenticated = require("./Authenticated.react.jsx");
var ApiService = require("../services/ApiService.js");

var Home = Authenticated(React.createClass({
    componentWillMount: function() {
        ApiService.init(socketio());
    },

    // listen: function() {

    //     this.socket.on('new-node', console.log)
    //     this.socket.on('new-link', console.log)

    //     this.socket.emit("Source.create", {
    //         screen_name: "PeterTatchell",
    //         user_id: 31135856
    //     }, (error, source) => {

    //         this.socket.emit("Target.create", {
    //             screen_name: "ggreenwald",
    //             user_id: 16076032
    //         }, (error, target) => {
    //             var campaign = {
    //                 name: "new campaign",
    //                 // sources: [
    //                 //     { screen_name: "hrw" }
    //                 // ],
    //                 // targets: [
    //                 //     { screen_name: "noradio" }
    //                 // ],
    //                 sources: [source._id],
    //                 targets: [target._id],

    //                 handle: "hrw",
    //                 description: "description"
    //             }

    //             this.socket.emit('Campaign.create', campaign, function(error, data) {
    //                 console.log(data);
    //             });
            
    //         });
    //     })
    // },

    render: function() {
        return (
        <div class="project">
            <nav>
              <div className="row">
                <div className="large-12 columns">
                  <div className="icon-bar three-up">
                    <a href="visualize.html" className="item">
                      <i className="fa fa-tachometer" />
                      <label>Visualize</label>
                    </a>
                    <a href="project.html" className="item active">
                      <i className="fa fa-cogs" />
                      <label>Project editor</label>
                    </a>
                    <a href="login.html" className="item">
                      <i className="fa fa-unlock" />
                      <label>Log out</label>
                    </a>
                  </div>
                </div>
              </div>
            </nav>

            <h1>Hello {this.props.user.username}</h1>

            <Router.RouteHandler/>

        </div>
        )
    }
}))

module.exports = Home;