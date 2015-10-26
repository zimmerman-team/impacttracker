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
                  <a className="navbar-brand" href="/frontpage.html">
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
                    <h1>Do you know whether you reach your targets <br />
                    – when you launch an advocacy campaign?</h1>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-4">
                    <h2>
                      Impact Tracker helps to monitor, 
                      visualise and measure the impact 
                      of your Twitter campaign
                    </h2>
                    <p>
                      ✔ Monitor all communication streams<br />
                      ✔ Track dissemination flows<br />
                      ✔ Trace through whom you reach target audiences
                    </p>
                    <p>
                      Impact Tracker is developed by the Peace Informatics Lab (Leiden University) in collaboration with Human Rights Watch and Zimmerman & Zimmerman. 
                    </p>
                    <a className="btn btn-block btn-login" onClick={this.login}>
                        Login here with your Twitter account <br />to create your first campaign
                    </a>
                    <p>
                      Questions about this project? Please contact Thomas Baar, Project Manager Peace Informactics Lab
                    </p>
                    
                  </div>
                  <div className="col-lg-8 text-right login-logos">
                    <img src="img/university_leiden.png" />
                    <img src="img/zimmermanzimmerman.png" />
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
