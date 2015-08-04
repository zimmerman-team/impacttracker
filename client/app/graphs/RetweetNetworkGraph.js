/*
    Graph test    
*/

var d3 = require("d3");
var tip = require("d3-tip")(d3);
var _ = require("lodash")

Math.logBase = function(base, n) {
    return Math.log(n) / Math.log(base);
}

// A line node container, nodes are displayed on the line
function LineContainer(x1, y1, x2, y2, options) {
    if (arguments.length > 0) { // for inheritance
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.options = typeof options !== "undefined" ? options : {};
    } 

    this.radius_scale = 0; // determined when adding nodes

    this.nodes = [];

    this.linkDict = {}

}

LineContainer.prototype.draw = function(parent) {
    /*
        For optional circle visibility
    */

}

LineContainer.prototype.getCoords = function(i) {
    var min_y_space = 10; // minimal space between nodes

    if ((this.y2 / this.nodes.length) < 10) {
        this.y1 -= ((this.y2 - this.y1) / 4)   
        this.y2 += ((this.y2 - this.y1) / 4)   
    }


    return {
        x: this.x1,
        y: this.y1 + ((Math.abs(this.y1) + this.y2) / this.nodes.length) * i 
    }
}

LineContainer.prototype.addNode = function(id, data, update) {
    this.nodes.push({
        "id": id,
        "data": data
    });

    // initialize source and target dict
    _sourceDict[id] = [];
    _targetDict[id] = []; 

    if (update) {
        this.updateNodes(); // the order here matters
        updateLinks();
    }
}

LineContainer.prototype.findNode = function(id) {
    for (var i in this.nodes) {
        if (this.nodes[i]["id"] === id) return this.nodes[i]
    }
}

LineContainer.prototype.updateNodes = function() {
    var self = this;

    _.forEach(this.nodes, function(node, i) {
        var coords = self.getCoords(i);
        node.x = coords.x;
        node.y = coords.y;
        node.fixed = true;
    });

    var max_amount = d3.max(this.nodes, function(d) {
        return _nodeScale === "log" ? Math.logBase(10, maxLinks) : maxLinks  
    })

    // todo: better scale
    // var radius_scale = d3.scale.pow().exponent(0.5).domain([0, max_amount]).range([1, 2]);
    var linear_radius_scale = d3.scale.linear().domain([0, max_amount]).range([2, 25]);
    var log_radius_scale = d3.scale.log().clamp(true).domain([1, max_amount]).range([2, 25]);

    var nodeGroup = _svg.selectAll("." + this.options.uniqueNodeGroupClass) // todo: use options.className
        .data(this.nodes, function (d) {
            return d.id;
        })

    // enter selection
    var nodeGroupEnter = nodeGroup.enter()
        .append("g")
        .attr("class", "nodeGroup " + this.options.uniqueNodeGroupClass) // todo: add as html5 data- attribute to identify
        
    nodeGroupEnter.append("circle")
    nodeGroupEnter.append("text")

    // update selection
    nodeGroup.select("circle")
        .attr("class", "node") // todo: add as html5 data- attribute to identify
        .attr("r", function(d) {
            var thisLinks = numLinks(d.id);
            if (thisLinks > maxLinks) maxLinks = thisLinks; 
            // console.log(Math.logBase(10, thisLinks))
            // console.log(radius_scale(Math.logBase(10, thisLinks)))

            return _nodeScale === "log" ? log_radius_scale(Math.logBase(10, thisLinks)) : linear_radius_scale(thisLinks)
        })
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        })
        .on("mouseover", function(d) {
            if (!_focusLock) {
                var intermediateConnections = fade(d.id, 0.1);

                // get links
                var sources = _sourceDict[d.id];
                var targets = _targetDict[d.id];

                d3.selectAll('.node-depth-selection').on("change", function() {
                    // console.log(this);
                })

                return tip.show(sources, targets, intermediateConnections, d);
            }
        })
        .on("click", function(d) {
            _focusLock = true;
            d3.event.stopPropagation();
        })
        .on("mouseout", function(d) {
            if (!_focusLock) {
                _svg.selectAll('.nodeGroup, .link').style("opacity", 1);
                if (!_textToggle) _svg.selectAll('.nodeText').style("opacity", 0);
                tip.hide(d);
            }
        })

    var label = nodeGroup.select("text")
        .attr("class", "nodeText")
        .attr("dx", function(d) {
            // todo: get radius directly from circle
            return _nodeScale === "log" ? log_radius_scale(Math.logBase(10, numLinks(d.id))) + 5 : linear_radius_scale(numLinks(d.id)) + 5
        })
        .attr("dy", ".35em")
        .attr("opacity", 0)
        .text(function(d) {
            return d.data.user.screen_name;
        })
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        })


    // exit selection
    nodeGroup.exit().remove()

}

LineContainer.prototype.deleteNode = function(node) {
    _.find()
}

LineContainer.prototype.swapNodes = function(node1, node2) {
    
}

// A line node container, nodes are displayed on the line
function CircleContainer(cx, cy, r, options) {
        this.cx = cx;
        this.cy = cy;
        this.r = r;
        this.options = typeof options !== "undefined" ? options : {};

    this.radius_scale = 0; // determined when adding nodes

    this.nodes = [];
}

CircleContainer.prototype = new LineContainer(); // inherit some methods; we overwrite most of them

CircleContainer.prototype.draw = function(parent) {
    this.instance = parent.append("circle")
        .attr("cx", this.cx)
        .attr("cy", this.cy)
        .attr("r", this.r)
        .attr('class', 'unrelatedcircle')       
}

CircleContainer.prototype.getCoords = function(i) {
    var degree = 360 / (this.nodes.length),
        rad = (Math.PI / 180) * degree,
        irad = rad * i,
        x = Math.floor(this.cx + Math.cos(irad) * this.r),
        y = Math.floor(this.cy + Math.sin(irad) * this.r)

        return {
            x: x,
            y: y
        }
}


var fade = function(id, opacity, indirect, turnOff, groupToFade) {
    var indirect = typeof indirect === "undefined" ? true : indirect;
    var turnOff = typeof turnOff === "undefined" ? true : turnOff;
    var groupToFade = typeof groupToFade === "undefined" ? null : groupToFade;

    if (turnOff) {
        _svg.selectAll(".nodeGroup, .link")
            .style("opacity", opacity); // initialize to 0

        var intermediateNodes = []; 
    }

    var sources = _sourceDict[id];
    var targets = _targetDict[id];
    var group = _layerDict[id]; // first item is the group name...

    // for now, no difference between source -> target and target -> source
    var combined = _.union(sources, targets, [id]);

    if (groupToFade) {
        var nodeFilter = function(d) {
            return _.includes(combined, d.id)
                && _layerDict[d.id] === groupToFade
        };

        var linkFilter = function(d) {
            return (d.source.id === id || d.target.id === id)
                && (_layerDict[d.source.id] === groupToFade || _layerDict[d.target.id] === groupToFade);
        };
    } else {
        var nodeFilter = function(d) {
            return _.includes(combined, d.id)
        };

        var linkFilter = function(d) {
            return d.source.id === id || d.target.id === id;
        };
    }

    var filteredNodes = _svg.selectAll(".nodeGroup")
        .filter(nodeFilter)
        .style("opacity", 1);

    filteredNodes.select("text")
        .style("opacity", 1)

    var filteredLinks = _svg.selectAll('.link')
        .filter(linkFilter)
        .style("opacity", 1)


    if (indirect && group !== "intermediaries") {
        _.forEach(combined, function(id) {
            if (_layerDict[id] === "intermediaries") {
                var groupToFade = group === "sources" ? "targets" : "sources";
                intermediateNodes.push(fade(id, opacity, true, false, groupToFade)) // also fade-in intermediate nodes and link connections
            }
        })
    }

    return groupToFade ? filteredNodes.data() : _.flatten(intermediateNodes);
}

var numLinks = function(id) {
    return _sourceDict[id].length + _targetDict[id].length
}

var getLinks = function(id) {
    return _.union(_sourceDict[id], _targetDict[id]);
}

// Links are global
var addLink = function(source, target, update) {
    var source = source.split(":");
    var target = target.split(":");

    var sourceGroup = source[0];
    var sourceId = source[1];
    var targetGroup = target[0];
    var targetId = target[1];

    var sourceNode = _groups[source[0]].findNode(source[1]),
        targetNode = _groups[target[0]].findNode(target[1]);

    if (!sourceNode || !targetNode) {
        console.log("doesnt exist");
        return;  
    } 

    // update linkDict
    // source -> target
    _sourceDict[sourceId].push(targetId);
    // target -> source
    _targetDict[targetId].push(sourceId)


    links.push({
        source: sourceNode,
        target: targetNode,
        intermediate: {} // intermediate node for bezier curves
    });

    if (update) {
        updateLinks();
    }
}

var updateLinks = function() {
    var link = _svg.selectAll(".link")
        .data(links, function (d) {
            return d.source.id + d.target.id;
        })

    var diagonal = d3.svg.diagonal()
        .source(function(d) {
            return {"x": d.source.y, "y": d.source.x };
        })
        .target(function(d) {
            return {"x": d.target.y, "y": d.target.x};
        })
        .projection(function(d) {
            return [d.y, d.x]
        })

    // todo: nodes in same group: curved line
    var line = d3.svg.line()
        .x(function(d) { return d.x })
        .y(function(d) { return d.y })
        .interpolate("linear")

    //update
    link
        .transition()
        .attr("d", diagonal)

    // new links
    link.enter()
        .insert("path", ".nodeGroup")
        .attr("id", function(d) {
            return d.source.id + "-" + d.target.id;
        })
        .attr("class", "link")
        .attr("d", diagonal)
        // .attr("class", "node" + this.uniqueSelector)

    link.exit().remove()

    // update node radius
    // todo: improve performance
    _.forEach(_groups, function(group) {
        group.updateNodes();
    })


}


// todo: bad method, change this -> not on window
Window.depthChanged = function() {
    var selection = d3.selectAll('.node-depth-selection')

    var direct = selection[0][0].checked
    var id = selection[0][0].attributes["data-id"].value;
    var indirect = selection[0][1].checked

    fade(id, 0.1, indirect)
}

// var CustomToolTip = {
//     init: function() {
//         d3.select("#tooltip")
//             .append("div")
//             .class("d3-tip")
//             .style("opacity", 0)

//     }

//     show: function(sources, targets, intermediateConnections, d) {
//         d3.select("#tooltip")
//             .html()

//     },

//     hide: function() {

//     }
// }

// todo: remove this dependency, rewrite to d3 select notation -> no direct html
// also, this is not really a tooltip kind of functionality
var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(sources, targets, intermediateConnections, d) {

    var sourcetargets = _.union(sources, targets);

    var nsources = [];
    var ntargets = [];
    var nintermediaries = [];
    var nintermediateconnections = intermediateConnections;
    var nunrelated = [];

    _.forEach(sourcetargets, function(item) {
        switch(_layerDict[item]) {
            case "source":
                nsources.push(item)
                break;
            case "target":
                ntargets.push(item)
                break;
            case "intermediary":
                nintermediaries.push(item)
                break;
            case "unrelated":
                nunrelated.push(item)
                break;
        }
    });

    // if (_layerDict[d.id] === "sources") {
    //     ntargets = _.union(ntargets, _.map(nintermediateconnections, function(i) { return i.id }))
    // } else if (_layerDict[d.id] === "targets"){
    //     nsources = _.union(nsources, _.map(nintermediateconnections, function(i) { return i.id }))
    // }

    var html = ""

    html +=("<b><a href=\"" + "https://twitter.com/"+ d.data.user.screen_name + "\">" + d.data.user.screen_name + "</a>"  + "</b><br />")

    html += ("<input onchange=\"Window.depthChanged()\" class=\"node-depth-selection\" type=\"checkbox\" data-id=\"" + d.id + "\" checked> Direct")
    html += ("<input onchange=\"Window.depthChanged()\" class=\"node-depth-selection\" type=\"checkbox\" data-id=\"" + d.id + "\" checked> Indirect")

    // d3.select("input[name=''').on("change", function() {
    //     if (this.checked) {
    //         _svg.selectAll(".nodeText").style("opacity", 1);
    //         _textToggle = true;
    //     } else {
    //         _svg.selectAll(".nodeText").style("opacity", 0);
    //         _textToggle = false;
    //     }
    // });


    if (ntargets.length) {
        html += "<ul>"
        html += ("<b>Targets</b> <br><ul class='tip-targets'>")
        _.forEach(ntargets, function(source) {
            html += ("<li>" + _nodeDict[source].data.user.screen_name + "</li>")
        })
        html += ("</ul>")
    }

    if (nintermediateconnections.length) {
        html += "<ul>"
        html += ("<b>Indirect " + (_layerDict[d.id] === "sources" ? "targets" : "sources") + "</b> <br><ul class='tip-targets'>")
        _.forEach(nintermediateconnections, function(source) {
            html += ("<li>" + source.data.user.screen_name + "</li>")
        })
        html += ("</ul>")
    }

    if (nsources.length) {
        html += "<ul>"
        html += ("<b>Sources</b> <br><ul class='tip-sources'>")
        _.forEach(nsources, function(source) {
            html += ("<li>" + _nodeDict[source].data.user.screen_name + "</li>")
        })
        html += ("</ul>")
    }

    if (nintermediaries.length) {
        html += "<ul>"
        html += ("<b>Intermediaries</b> <br><ul class='tip-intermediaries'>")
        _.forEach(nintermediaries, function(source) {
            html += ("<li>" + _nodeDict[source].data.user.screen_name + "</li>")
        })
        html += ("</ul>")
    }

    if (nunrelated.length) {
        html += "<ul>"
        html += ("<b>Unrelated</b> <br><ul class='tip-unrelated'>")
        _.forEach(nunrelated, function(source) {
            html += ("<li>" + _nodeDict[source].data.user.screen_name + "</li>")
        })
        html += ("</ul>")
    }

    return html
  })

var _svg = null;

var maxLinks = 0; // the biggest node size
var links = [];

var _nodeDict = {}; // id -> node lookup
var _sourceDict = {}; // keep track of source -> targets links
var _targetDict = {}; // keep of track of sources <- target links
var _layerDict = {}; // keep track of what layer the node with id x is in
var _groups = {}; // layer to container dict

var _focusLock = false; // _focusLock for tooltip
var _textToggle = false;
var _nodeScale = "linear" // default node scale


var RetweetNetworkGraph = {
    create: function(el, props, state) {
        // todo: make responsive
        // todo: scale according to div width
        var clientWidth = Window.innerWidth || document.documentElement.clientWidth || document.getElementsByTagName('body')[0].clientWidth,
            clientHeight = Window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight
       
        var margin = {top: 50, right: 0, bottom: 50, left: 0},
            width = clientWidth - margin.left - margin.right,
            height = clientHeight - margin.top - margin.bottom;

        // zoom behaviour
        var zoom = d3.behavior.zoom()
            .scaleExtent([0.2, 10])
            .on('zoom', function() {
                _svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")"); 
            })

        var drag = d3.behavior.drag()
            .on("dragstart", function(d) {
                d3.event.sourceEvent.stopPropagation();
                d3.event.sourceEvent.preventDefault();
            })    

        _svg = d3.select(el)
            .append("svg")
            .attr("class", "retweetNetworkChart") // todo: remove this, instead append to child of el
            .call(drag)
            .on("click", function() {
                if (d3.event.defaultPrevented) return;

                _focusLock = false;
                tip.hide();
                _svg.selectAll('.nodeGroup, .link').style("opacity", 1);
                
                if (!_textToggle) {
                    _svg.selectAll('.nodeText').style("opacity", 0);
                }
            })
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("overflow", "visible")
            .call(zoom) // zoom behaviour on parent container
            .append('g')
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        var circleWidth = width / 3;
        var circleCenter = circleWidth / 2;

        var lineWidth = (2 * width/3) / 3;
        var lineOffset = lineWidth / 2;

        var line1 = circleWidth + lineOffset;
        var line2 = circleWidth + lineWidth + lineOffset;
        var line3 = circleWidth + 2*lineWidth + lineOffset;

        d3.select(window).on('resize', RetweetNetworkGraph.resize);

        _groups = {
            "unrelated": new CircleContainer(circleCenter, height/2, circleWidth/3, {
                "uniqueNodeGroupClass": "unrelated1",
                "nodeGroup": "unrelated"
            }),
            "unrelated2": new CircleContainer(circleCenter, height/2, circleWidth/4, {
                "uniqueNodeGroupClass": "unrelated2",
                "nodeGroup": "unrelated"
            }),
            "unrelated3": new CircleContainer(circleCenter, height/2, circleWidth/5, {
                "uniqueNodeGroupClass": "unrelated3",
                "nodeGroup": "unrelated"
            }),
            "unrelated4": new CircleContainer(circleCenter, height/2, circleWidth/6, {
                "uniqueNodeGroupClass": "unrelated4",
                "nodeGroup": "unrelated"
            }),
            "source": new LineContainer(line1, 0, line1, height, {
                "uniqueNodeGroupClass": "sources",
                "nodeGroup": "sources"
            }),
            "intermediary": new LineContainer(line2, 0, line2, height, {
               "uniqueNodeGroupClass": "intermediaries",
                "nodeGroup": "intermediaries"
            }),
            "target": new LineContainer(line3, 0, line3, height, {
                "uniqueNodeGroupClass": "targets",
                "nodeGroup": "targets"
            })
        }

        _svg.call(tip);

    },

    destroy: function() {
        // some cleanup
        _layerDict = {};
        _groups = {};
        _svg.remove();
        _svg = null;        
        
    },

    resize: function() {
        // todo: resize windows appropriately

    },

    addNode: function(node, redraw=false) {
        _groups[node.layer].addNode(node.id, node.data, redraw);

        _layerDict[node.id] = node.layer;
        _nodeDict[node.id] = node;
    },

    addLink: function(link, redraw=false) {
            var source = link.source;
            var target = link.target;

            var sourceLayer = _layerDict[source];
            var targetLayer = _layerDict[target];  

            // console.log(source)
            // console.log(target)

            // console.log("sourceLayer: " + sourceLayer)
            // console.log("targetLayer: " + targetLayer)

            addLink(sourceLayer + ":" + source, targetLayer + ":" + target, redraw);
    },

    // initial load given a JSON graph file
    load: function(json) {
        var nodes = json.nodes;
        var links = json.edges;

        _.forEach(nodes, RetweetNetworkGraph.addNode);
        _.forEach(links, RetweetNetworkGraph.addLink);

        _.forEach(_groups, function(group) {
            group.updateNodes();
        })
        updateLinks();
    },

    toggleLabels: function(toggle) {
        var opacity = toggle ? 1 : 0;

        _svg.selectAll(".nodeText").style("opacity", opacity);
        _textToggle = toggle;
    },

    setScale: function(scale) {
        _nodeScale = scale;

        _.forEach(_groups, function(group) {
            group.updateNodes();
        })
    }

}

module.exports = RetweetNetworkGraph;