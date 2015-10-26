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
            <div className="container campaignview">
                <div className="row">
                    <div className="col-lg-8">
                       <Button className="new-campaign" onClick={RouterContainer.get().transitionTo.bind(null, "/home/campaign/new")} bsStyle="primary" bsSize="large"><Glyphicon glyph='plus' /> New campaign</Button>
                        * Max 10 campaigns, ask us for custom impact features for your organisation.
                    </div>
                </div>
                <CampaignTable campaigns={this.state.campaigns}/>


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
                    <p>
                        <img src="img/human_rights_watch_black.png" />
                        <img src="img/university_leiden_black.png" />
                        <img src="img/zimmermanzimmerman_black.png" />
                    </p>
                    <p>
                      Questions about this project? Please contact Thomas Baar, Project Manager Peace Informactics Lab
                    </p>
                    
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
            <div>
               <div className="row">
                   <div className="col-lg-3">
                        Campaign name
                   </div>
                   <div className="col-lg-3">
                        Start date
                   </div>
                   <div className="col-lg-2">
                        State
                   </div>
                   <div className="col-lg-4">

                   </div>
               </div>
                {rows}
           </div>
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
            <div className="row">
                <div className="col-lg-3">
                    {campaign.name}
                </div>
                <div className="col-lg-3">
                    {moment(campaign.creationDate).format('MMMM Do YYYY, h:mm:ss a')}
                </div>
                <div className="col-lg-2">
                    {campaign.state}
                </div>
                <div className="col-lg-4">
                    <span className="actions">
                        <Button bsStyle='primary' onClick={RouterContainer.get().transitionTo.bind(null, "/home/campaign/view/" + campaign._id)}><Glyphicon glyph='stats' /> View</Button>
                        {stopButton}
                        <Button bsStyle='danger' onClick={this._onDeleteCampaignClick.bind(null, campaign._id)}><Glyphicon glyph='trash' /> Delete</Button>
                    </span>
                </div>
            </div>
        )
    }
})


module.exports = Campaign;