var React = require('react')
var _ = require('lodash')
var Authenticated = require("./Authenticated.react.jsx");
var CampaignStore = require("../stores/CampaignStore")

// var Accordion = require('react-foundation-apps/lib/accordion');
var ActionSheet = require('react-foundation-apps/lib/action-sheet');

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
        <div className="project">
            <section className="middle">
                <div className="row">
                    <div className="large-12 columns">
                        <button className="btn addnew">Add a new campaign</button>
                    </div>
                </div>
            </section>

            <div className="row">
                <div className="large-12 columns">
                    <CampaignTable campaigns={this.state.campaigns}/>
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
           <table>
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
           </table>
        )
    }
})

var CampaignRow = React.createClass({
    render: function() {
        var campaign = this.props.campaign;
        return (
            <tr>
                <td>{campaign.name}</td>
                <td>{campaign.handle}</td>
                <td>{campaign.author}</td>
                <td>{campaign.completed}</td>
                <td>{campaign.runAt || "-"}</td>
                <td>
                    <ActionSheet>
                        <ActionSheet.Button title="Action Sheet" />
                        <ActionSheet.Content>
                            <p>Tap to share</p>
                            <ul>
                                <li><a href="#">Twitter</a></li>
                                <li><a href="#">Facebook</a></li>
                                <li><a href="#">Mail</a></li>
                            </ul>
                        </ActionSheet.Content>
                    </ActionSheet>

                    <button className="button dropdown" aria-expanded="false" aria-controls="drop1" data-dropdown="drop1" href="#">Dropdown Button</button><br />
                    <ul aria-hidden="true" className="f-dropdown" data-dropdown-content id="drop1">
                        <li><a href="#">This is a link</a></li>
                        <li><a href="#">This is another</a></li>
                        <li><a href="#">Yet another</a></li>
                    </ul>
                </td>
            </tr>
        )
    }
})


module.exports = Campaign;