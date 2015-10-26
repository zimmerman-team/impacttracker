var React = require('react');
var AuthService = require('../services/AuthService');
var Input = require('react-bootstrap').Input;
var ButtonInput = require('react-bootstrap').ButtonInput;
var LoginStore = require("../stores/LoginStore")
var LoginActions = require("../actions/LoginActions")
var RouterContainer = require('../util/RouterContainer')

var Login = React.createClass({
    getInitialState: function() {
        return {
            user: "",
            password: ""
        };
    },

    login: function(e) {
        e.preventDefault();

        // var username = (this.refs.username).getInputDOMNode().value.trim();
        // var password = (this.refs.password).getInputDOMNode().value.trim();

        // AuthService.login(username, password)
        //     .catch(function(error) {
        //         console.log("error logging in", error)
        //     })

        AuthService.twitterAuth();
    },

    render: function() {
        return (
          <div>
            <nav id="navi" className="navbar navbar-inverse">
              <div className="container">
                {/* Brand and toggle get grouped for better mobile display */}
                <div className="navbar-header">
                  <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#nav-collapse" aria-expanded="false">
                    <span className="sr-only">Toggle navigation</span>
                    <span className="icon-bar" />
                    <span className="icon-bar" />
                    <span className="icon-bar" />
                  </button>
                  <a className="navbar-brand" href="/">
                    <span> Impact Tracker</span><br />
                    <span className="sub-logo">beta version</span>
                  </a>
                </div>
                {/* Collect the nav links, forms, and other content for toggling */}
              
              </div>{/* /.container-fluid */}
            </nav>
            <div id="login-wrapper">
              <div className="container">
                <div className="row">
                  <div className="col-lg-10">
                    <h1>Do you know whether you reach your targets – when you launch an advocacy campaign?</h1>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-4">
                    <h2>
                      Impact Tracker helps to monitor, 
                      visualise and measure the impact 
                      of your Twitter campaign
                    </h2>
                    <ul className="fa-ul">
                      <li><i className="fa-li fa fa-check"></i>Monitor all communication streams</li>
                      <li><i className="fa-li fa fa-check"></i>Track dissemination flows</li>
                      <li><i className="fa-li fa fa-check"></i>Trace through whom you reach target audiences</li>
                    </ul>
                    <p>
                      <small>Impact Tracker is developed by the Peace Informatics Lab (Leiden University) in collaboration with Human Rights Watch and Zimmerman & Zimmerman. </small>
                    </p>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-4">
                    <a className="btn btn-block btn-login" onClick={this.login}>
                        Login here with your Twitter account <br />to create your first campaign
                    </a>
                  </div>
                  <div className="col-lg-8 text-right-lg logos">
                    <img src="img/leiden.svg" />
                    <img src="img/hrw.png" />
                    <img src="img/zz-logo.svg" />
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-4">
                    <p>
                      <small>Questions about this project? Please contact Thomas Baar, Project Manager Peace Informactics Lab</small>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    },


    componentDidMount: function() {
        if (window.user) {
            LoginActions.loginUser(window.user)
        }
            // RouterContainer.get().transitionTo('/home/campaign');
    }

})

module.exports = Login
