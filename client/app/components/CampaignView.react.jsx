var React = require('react')
var Router = require('react-router');
var _ = require('lodash')
var CampaignStore = require("../stores/CampaignStore")

var TabbedArea = require('react-bootstrap').TabbedArea;
var TabPane = require('react-bootstrap').TabPane;

function getCampaignState(id) {
    console.log('called get state!')
    return {
        campaign: CampaignStore.get(id),
        sources: CampaignStore.getAllSources(),
        targets: CampaignStore.getAllTargets()
    }
}

var CampaignView = React.createClass({

    getInitialState: function() {
        return getCampaignState(this.props.params.id);
    },

    render: function() {
        return (
          <TabbedArea defaultActiveKey={2}>
            <TabPane eventKey={1} tab='Campaign'>this.state.campaign</TabPane>
            <TabPane eventKey={2} tab='Retweet network graph'><NetworkGraph campaign={this.state.campaign}/></TabPane>
            <TabPane eventKey={3} tab='Line graphs'><LineGraph /></TabPane>
          </TabbedArea>
        )
    },

    componentDidMount: function() {
        CampaignStore.addChangeListener(this._onChange);
        this.setState(getCampaignState(this.props.params.id));
    },

    componentWillUnmount: function() {
        CampaignStore.removeChangeListener(this._onChange);
    },

    _onChange: function() {
        this.setState(getCampaignState(this.props.params.id));
    }

})

var RetweetNetworkGraph = require('../graphs/RetweetNetworkGraph');
var ApiService = require('../services/ApiService');

var NetworkGraph = React.createClass({

    componentDidMount: function() {
        var el = this.getDOMNode();
        RetweetNetworkGraph.create(el);

        console.log("binding events...")

        var socket = ApiService.getSocket();

        console.log(this.props.campaign._id)

        // gets initial graph
        socket.emit("Campaign.getGraph", this.props.campaign._id, function(error, graph) {
            if (error) throw error;

            console.log(typeof graph)
            RetweetNetworkGraph.load(JSON.parse(graph))
        })

        ApiService.socketOn(this.props.campaign._id + ':new-node', RetweetNetworkGraph.addNode);
        ApiService.socketOn(this.props.campaign._id + ':new-link', RetweetNetworkGraph.addLink);
    },

    componentWillUnmount: function() {
        var el = this.getDOMNode();
        RetweetNetworkGraph.destroy();

        ApiService.socketOff('new-node', RetweetNetworkGraph.addNode);
        ApiService.socketOff('new-link', RetweetNetworkGraph.addLink);
    },

    render: function() {
        return (
            <div className="retweetNetworkChart" ></div>
        )
    }
})

var LineGraph = React.createClass({
    render: function() {
        return <h1>Linegraph</h1>
    }
})


module.exports = CampaignView;