var React = require('react')
var Router = require('react-router');
var _ = require('lodash')
var Authenticated = require("./Authenticated.react.jsx");
var CampaignStore = require("../stores/CampaignStore")
var ApiService = require("../services/ApiService.js");

var Table = require('react-bootstrap').Table;
var SplitButton = require('react-bootstrap').SplitButton;
var MenuItem = require('react-bootstrap').MenuItem;
var Button = require('react-bootstrap').Button;
var Glyphicon = require('react-bootstrap').Glyphicon;
var Input = require('react-bootstrap').Input;

var moment = require("moment")

var RouterContainer = require('../util/RouterContainer')

function getCampaignState() {
    return {
        campaigns: CampaignStore.getAll()
    }
}

var Campaign = React.createClass({

    getInitialState: function() {
        return getCampaignState();
    },

    render: function() {

        return (
            <div>
              <div className="container campaignview">
                <div className="row">
                    <div className="col-lg-8">
                       <Button className="new-campaign" onClick={RouterContainer.get().transitionTo.bind(null, "/home/campaign/new")} bsStyle="primary" bsSize="large"><Glyphicon glyph='plus' /> New campaign</Button>
                        <span className="max10">* Max 5 campaigns, ask us for custom impact features for your organisation.</span>
                    </div>
                </div>
                <CampaignTable campaigns={this.state.campaigns}/>
              </div>

              <div id="login-wrapper" className="inverted">
                <div className="container campaignview">
                  <div className="row">
                    <div className="col-lg-10">
                      <h1>Help us further develop this prototype</h1>
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
                    <div className="col-lg-8">
                      <div className="logos">
                        <a href="http://www.leidenuniv.nl/" target="_blank"><img src="img/leiden-bl.svg" /></a>
                        <a href="https://www.hrw.org/" target="_blank"><img src="img/hrw-bl.png" /></a>
                        <a href="https://www.zimmermanzimmerman.nl/" target="_blank"><img src="img/zz-logo-bl.svg" /></a>
                      </div>
                    </div>
                  </div>
                  <div className="row foot bl">
                    <div className="col-lg-4">
                      <p>
                        <small>Questions about this project? Please contact <a href="http://campusdenhaag.nl/over/medewerkers-c4i/thomasbaar.html" target="_blank">Thomas Baar</a>, Project Manager Peace Informactics Lab</small>
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </div>

        )
    },

    componentDidMount: function() {
        CampaignStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        CampaignStore.removeChangeListener(this._onChange);
    },

    _onChange: function() {
        this.setState(getCampaignState());
    }
})

var CampaignTable = React.createClass({
    render: function() {

        var rows = [];

        _.forEach(this.props.campaigns, function(campaign) {
            rows.push(<CampaignRow campaign={campaign}/>)
        })

        return (
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>
                      Campaign name
                  </th>
                  <th>
                      Start date
                  </th>
                  <th>
                      State
                  </th>
                  <th>

                  </th>
                </tr>
              </thead>
              <tbody>
                {rows}
              </tbody>
            </table>
        )
    }
})

var CampaignRow = React.createClass({ // todo: fix react-bootstrap routes: https://github.com/rackt/react-router/issues/83
    
    _onDeleteCampaignClick: function(id) {
        var result = confirm("Are you sure you want to delete this campaign? This cannot be undone");
        if (result) {
            ApiService.deleteCampaign(id);
        }
    },

    _onStopCampaignClick: function(id) {
        ApiService.stopCampaign(id);
    },

    render: function() {
        var campaign = this.props.campaign;

        var stopButton = campaign.state === "running" ?
            <Button bsStyle='info' onClick={this._onStopCampaignClick.bind(null, campaign._id)}><Glyphicon glyph='edit' /> Stop</Button>
            : null

        return (
            <tr>
                <td>
                    {campaign.name}
                </td>
                <td>
                    {moment(campaign.creationDate).format('MMMM Do YYYY, h:mm:ss a')}
                </td>
                <td>
                    {campaign.state}
                </td>
                <td>
                    <span className="actions">
                        <Button bsStyle='primary' onClick={RouterContainer.get().transitionTo.bind(null, "/home/campaign/view/" + campaign._id)}><Glyphicon glyph='stats' /> View</Button>
                        {stopButton}
                        <Button bsStyle='danger' onClick={this._onDeleteCampaignClick.bind(null, campaign._id)}><Glyphicon glyph='trash' /> Delete</Button>
                    </span>
                </td>
            </tr>
        )
    }
})


module.exports = Campaign;