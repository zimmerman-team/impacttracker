var React = require('react')
var Router = require('react-router');
var _ = require('lodash')
var Authenticated = require("./Authenticated.react.jsx");
var CampaignStore = require("../stores/CampaignStore")

var Table = require('react-bootstrap').Table;
var SplitButton = require('react-bootstrap').SplitButton;
var MenuItem = require('react-bootstrap').MenuItem;
var Button = require('react-bootstrap').Button;

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
                <Button onClick={RouterContainer.get().transitionTo.bind(null, "/home/campaign/new")} bsStyle="primary" bsSize="large">New campaign</Button>
                <CampaignTable campaigns={this.state.campaigns}/>
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
           <Table striped bordered condensed hover>
               <thead>
                    <tr>
                        <th>Campaign</th>
                        <th>Subject(s)</th>
                        <th>Author</th>
                        <th>Completed</th>
                        <th>Planned date</th>
                        <th>Actions</th>
                    </tr>
               </thead>
               <tbody>
                    {rows}      
               </tbody>
           </Table>
        )
    }
})

var CampaignRow = React.createClass({ // todo: fix react-bootstrap routes: https://github.com/rackt/react-router/issues/83
    render: function() {
        var campaign = this.props.campaign;
        return (
            <tr>
                <td>{campaign.name}</td>
                <td>{campaign.handle}</td>
                <td>{campaign.author || "-"}</td>
                <td>{campaign.completed || false}</td>
                <td>{campaign.runAt || "-"}</td>
                <td>
                    <SplitButton bsStyle="Default" title="Edit">
                      <MenuItem onClick={RouterContainer.get().transitionTo.bind(null, "/home/campaign/" + campaign._id)}>Edit</MenuItem>
                      <MenuItem divider />
                      <MenuItem onClick={RouterContainer.get().transitionTo.bind(null, "/home/campaign/" + campaign._id + "/delete")}>Delete</MenuItem>
                    </SplitButton>
                </td>
            </tr>
        )
    }
})


module.exports = Campaign;