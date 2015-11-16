var React = require('react')
var Router = require('react-router');
var _ = require('lodash')
var moment = require("moment");
var CampaignStore = require("../stores/CampaignStore")

var TabbedArea = require('react-bootstrap').TabbedArea;
var TabPane = require('react-bootstrap').TabPane;

function getCampaignState(id) {
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
            <div className="tabs-wrap">
              <TabbedArea defaultActiveKey={2}>
                    { /*<TabPane eventKey={1} tab='Campaign'>this.state.campaign</TabPane>*/ }
                    <TabPane eventKey={2} tab='Network visualisation'>
                        <NetworkGraph campaign={this.state.campaign}/>
                    </TabPane>
                    <TabPane eventKey={3} tab='Graph visualisation'>
                        <div id="info-box">
                            <div className="container">
                                <h1 className="head">{this.state.campaign.handle}</h1>
                          </div>
                        </div>
                        <LineGraph campaign={this.state.campaign}/>
                    </TabPane>
              </TabbedArea>
            </div>
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

        var socket = ApiService.getSocket();

        // gets initial graph
        socket.emit("Campaign.getGraph", this.props.campaign._id, function(error, graph) {
            if (error) throw error;

            if (typeof graph === "string")
                graph = JSON.parse(graph)

            RetweetNetworkGraph.load(graph)

            ApiService.socketOn(this.props.campaign._id + ':new-node', function(node) {
                RetweetNetworkGraph.addNode(node, true);   
            });

            ApiService.socketOn(this.props.campaign._id + ':new-link', function(link) {
                RetweetNetworkGraph.addLink(link, true);
            });
        }.bind(this))

    },

    componentWillUnmount: function() {
        var el = this.getDOMNode();
        RetweetNetworkGraph.destroy();

        // todo: remove listeners properly
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
            <div className="container">
                <h1 className="head">{this.props.subject}</h1>
          </div>
          <div className="legend">
            <div className="container">
              <div className="legend-icon unrelated-color" />Unrelated
              <div className="legend-icon sources-color" />Sources
              <div className="legend-icon intermediaries-color" />Intermediaries
              <div className="legend-icon targets-color" />Targets
            </div>
          </div>
          <div className="controls">
            <div className="container">
                <span>
                  <input type="checkbox" onChange={this.props.toggleLabels} name="labels" id="labels" /><label htmlFor="labels">Show all labels</label>
                </span>
                <span>
                  <span>Node size scale:</span>
                  <input type="radio" name="scale" defaultValue="linear" onChange={this.props.setScale} id="linear" defaultChecked /><label htmlFor="linear">Linear</label>
                  <input type="radio" name="scale" defaultValue="log" onChange={this.props.setScale} id="log" /><label htmlFor="log">Log (base 10)</label>
                </span>
            </div>
          </div>
        </div>
        )
    }
})

var RetweetLineGraph = require('../graphs/RetweetLineGraph');

// group by multiple keys
_.mixin({groupByMulti: function (obj, values, context) {
    if (!values.length)
        return obj;
    var byFirst = _.groupBy(obj, values[0], context),
        rest = values.slice(1);
    for (var prop in byFirst) {
        byFirst[prop] = _.groupByMulti(byFirst[prop], rest, context);
    }
    return byFirst;
}});

var _preparedGraph = [];

var prepareData = function(graph, grouping="minute") {

    console.log('called prepareData')
    console.log(grouping)
    switch(grouping) {
        case "minute": 
            graph = _.groupByMulti(graph, [function(x) {
                return moment(new Date(x.tweet.created_at)).startOf('minute').format('x');
            }, "layer"])
            break;
            
        case "hour": 
            console.log('got hour')
            graph = _.groupByMulti(graph, [function(x) {
                return moment(new Date(x.tweet.created_at)).startOf('hour').format('x');
            }, "layer"])
            break;
    }

    // for (var prop in )
    // console.log(graph)

    // _.forEach(graph, function(elem) {
    //     graph

    // })

    graph = _.mapValues(graph, function(item) {
        return _.mapValues(item, function(value) {
            return value.length
        })
    });

    // todo: improve performance by removing this iteration (and maybe all iterations)
    graph = _.map(graph, function(value, key) {
        value.date = new Date(parseInt(key));
        // console.log(value.date)

        return value
    });

    return graph;
}


var LineGraph = React.createClass({

    getInitialState: function() {
        return {
            dateRange: "minute",
            data: null
        }
    },

    _changeDateAxis: function(daterange) {
        console.log('called with ' + daterange)
        this.setState({dateRange: daterange})
        this._getGraph()
    },

    _getGraph: function() {
        var socket = ApiService.getSocket();
        socket.emit("Campaign.getLineGraph", this.props.campaign._id, function(error, graph) {
            if (error) throw error;

            if (typeof graph === "string")
                graph = JSON.parse(graph)

            console.log('called with...')
            console.log(graph)
            console.log(this.state.dateRange)

            this.setState({
                data: prepareData(graph, this.state.dateRange)
            })

        }.bind(this))
    },

    componentDidMount: function() {
        RetweetLineGraph.create(this.refs.lineGraph.getDOMNode());

        this._getGraph();

        // todo: real-time updating of the graph
        // ApiService.socketOn(this.props.campaign._id + ':new-tweet', function(tweet) {
        //     console.log(tweet)

        //     var date = tweet.date;
        //     var layer = tweet.layer;
        //     var tweet = tweet.tweet;

        //     _preparedGraph[date] = _preparedGraph[date] || {};
        //     _preparedGraph[date][layer] = _preparedGraph[date][layer] || 0;
        //     _preparedGraph[date][layer] += 1;

        //     RetweetLineGraph.load(_preparedGraph, true);   
        // });

    },

    componentWillUnmount: function() {
        RetweetLineGraph.destroy();
        _preparedGraph = [];
 
        // todo: properly unbind events
        ApiService.socketOff('new-tweet', RetweetNetworkGraph.addLink);
    },

    render: function() {
        if (this.state.data)
            RetweetLineGraph.load(this.state.data, this.state.dateRange)

        return (
            <div>
                <SelectLineGraphAxes callback={this._changeDateAxis} />
                <div className="time-graph" ref="lineGraph">

                </div>
            </div>
        )
    }
})

var SelectLineGraphAxes = React.createClass({
    change: function(event) {
        this.props.callback(event.target.value);
    },

    render: function() {
        return (
            <div className="controls">
                <div className="container">
                    <span>
                        <input type="radio" name="scale" defaultValue="minute" onChange={this.change} id="minute" defaultChecked /><label htmlFor="minute">Tweets per minute</label>
                        <input type="radio" name="scale" defaultValue="hour" onChange={this.change} id="hour" /><label htmlFor="hour">Tweets per hour</label>
                    </span>
                </div>
            </div>
        )
    }
})

module.exports = CampaignView;
