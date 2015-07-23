var React = require('react');
var AuthService = require('../services/AuthService')

var Login = React.createClass({
    getInitialState: function() {
        return {
            user: "",
            password: ""
        };
    },

    login: function(e) {
        // e.preventDefault();

        var username = React.findDOMNode(this.refs.username).value.trim();
        var password = React.findDOMNode(this.refs.password).value.trim();

        AuthService.login(username, password)
            .catch(function(error) {
                console.log("error logging in", error)
            })
    },

    render: function() {
        return (
        // <form role="form" onSubmit={this.login}>
        //     <div className="form-group">
        //         <input type="text" placeholder="Username" ref="username" value="test"/>
        //         <input type="password" placeholder="Password" ref="password" value="test"/>
        //         <input type="submit" value="Post" />
        //     </div>
        // </form>
          <section className="middle">
            <div className="row">
              <div className="large-6 columns small-centered text-center">
                <div className="panel">
                  <h3>Log in</h3>
                  <form onsubmit="{this.login}">
                    <input type="text" defaultValue="test" ref="username" placeholder="Username" />
                    <input type="password" defaultValue="test" ref="password" placeholder="Password" />
                    <input className="button" type="submit" defaultValue="Post" />
                  </form>
                </div>
              </div>
            </div>
          </section>

        );
    },
    
//     <script src="bower_components/jquery/dist/jquery.min.js"></script>
//     <script src="bower_components/foundation/js/foundation.min.js"></script>
//     <script src="js/app.js"></script>
//   </body>
// </html>


    componentDidMount: function() {
        this.login()
    }

})

module.exports = Login