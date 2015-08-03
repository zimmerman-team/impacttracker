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

        ApiService.socketOn(this.props.campaign._id + ':new-node', function(node) {
            RetweetNetworkGraph.addNode(node, true);   
        });

        ApiService.socketOn(this.props.campaign._id + ':new-link', function(link) {
            RetweetNetworkGraph.addLink(link, true);
        });
    },

    componentWillUnmount: function() {
        var el = this.getDOMNode();
        RetweetNetworkGraph.destroy();

        ApiService.socketOff('new-node', RetweetNetworkGraph.addNode);
        ApiService.socketOff('new-link', RetweetNetworkGraph.addLink);
    },

    render: function() {
        return (
            <div>
                <InfoBox 
                    subject={this.props.campaign.handle}
                    toggleLabels={this._toggleLabels}
                    setScale={this._setScale} />      
                <div className="retweetNetworkChart" ></div>
            </div>
        )
    },

    _toggleLabels: function(event) {
        RetweetNetworkGraph.toggleLabels(event.target.checked)
    },

    _setScale: function(event) {
        console.log(event.target.value)
        RetweetNetworkGraph.setScale(event.target.value)
    }
})

var InfoBox = React.createClass({
    getDefaultProps: function() {
        return {
            nodeSizeScale: "log",
            showAllLabels: false,
            description: "Placeholder description",
            subject: "campaign"
        }
    },

    render: function() {
        return ( 
        <div id="info-box">
          <h3 className="hashtag">#{this.props.subject}</h3>
          <p>
            {this.props.description}
          </p>
          <p>
            <b>Legends</b><br />
          </p><div className="legend-icon unrelated-color" />Unrelated<br />
          <div className="legend-icon sources-color" />Sources<br />
          <div className="legend-icon intermediaries-color" />Intermediaries<br />
          <div className="legend-icon targets-color" />Targets<br />
          <p />
          <input type="checkbox" onChange={this.props.toggleLabels}/> Show all labels
          <br />
          Node size scale:
          <input type="radio" name="scale" defaultValue="linear" onChange={this.props.setScale} defaultChecked /> Linear
          <input type="radio" name="scale" defaultValue="log" onChange={this.props.setScale} /> Log (base 10)
        </div>
        )
    }
})

var LineGraph = React.createClass({
    render: function() {
        return <h1></h1>
    }
})


module.exports = CampaignView;