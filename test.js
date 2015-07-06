/*
    Graph test    
*/

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
    return {
        x: this.x1,
        y: (this.y2 / this.nodes.length) * i 
    }
}

LineContainer.prototype.addNode = function(id, data, update) {
    update = typeof update === "undefined" ? true : false;

    this.nodes.push({
        "id": id,
        "data": data
    });

    // initialize source and target dict
    if (!sourceDict.hasOwnProperty(id)) sourceDict[id] = [this.options.nodeGroup]; // check probaply not nescessary
    if (!targetDict.hasOwnProperty(id)) targetDict[id] = [this.options.nodeGroup]; // by convention, first item in dict is the group it belongs to, should change this

    if (update) {
        this.updateNodes(); // the order here matters
        updateLinks();
    }
}

LineContainer.prototype.addNodes = function(nodes) {
    var self = this;
    _.forEach(nodes, function(node) {
        self.addNode(node.id, node.data, false)
    })

    this.updateNodes();
    updateLinks();
}

LineContainer.prototype.findNode = function(id) {
    for (var i in this.nodes) {
        if (this.nodes[i]["id"] === id) return this.nodes[i]
    }
}


// LineContainer.prototype.fade = function(opacity) {
//     svg.selectAll("circle, line").style("opacity", opacity)

//     for (var i in this.nodes) {
//         if (this.nodes[i]["id"] === id) return this.nodes[i]
//     }   
// }

LineContainer.prototype.updateNodes = function() {
    var self = this;

    _.forEach(this.nodes, function(node, i) {
        var coords = self.getCoords(i);
        node.x = coords.x;
        node.y = coords.y;
        node.fixed = true;
    });

    var max_amount = d3.max(this.nodes, function(d) {
        // todo: return max links in the graph, set it as max
        return 100;
    })

    // todo: better scale
    // var radius_scale = d3.scale.pow().exponent(0.5).domain([0, max_amount]).range([1, 2]);
    var radius_scale = d3.scale.linear().domain([0, max_amount]).range([5, 25]);
    // var radius_scale = d3.scale.log().domain([0, max_amount]).range([5, 25]);

    var node = svg.selectAll("." + this.options.uniqueNodeClass) // todo: use options.className
        .data(this.nodes, function (d) {
            return d.id;
        })

    // update
    node
        .transition()
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        })
        .attr("r", function(d) {
            return radius_scale(numLinks(d.id))
        })



    // add new
    node.enter()
        .append("circle")
        // .attr("r", 20)
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        })
        .attr("class", "node " + this.options.uniqueNodeClass) // todo: add as html5 data- attribute to identify
        .on("mouseover", function(d) {
            if (!focusLock) {
                var intermediateConnections = fade(d.id, 0.1);

                // get links
                var sources = sourceDict[d.id];
                var targets = targetDict[d.id];

                tip.show(sources, targets, intermediateConnections, d);
            }
        })
        .on("click", function(d) {
            focusLock = true;
            d3.event.stopPropagation();
        })
        .on("mouseout", function(d) {
            if (!focusLock) {
                svg.selectAll('.node, .link').style("opacity", 1);
                tip.hide(d);
            }
        })

    // remove old elements
    node.exit().remove();


    // this.force.on("tick", function() {
    //     node.attr("transform", function(d) {
    //         console.log(d.y)
    //         return "translate(" + d.x + "," + d.y + ")";
    //     });

          // node.attr("cx", function(d) { return d.x; })
          //     .attr("cy", function(d) { return d.y; })
          //     .attr("r", function(d) { return d.r; })
    // })

    // this.force
    //     .nodes(this.nodes)
    //     .links(this.links)
    //     .size([width, height])
    //     .start();

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
        irad = rad * i;
        x = Math.floor(this.cx + Math.cos(irad) * this.r),
        y = Math.floor(this.cy + Math.sin(irad) * this.r)

    // console.log(degree);
    // console.log(this.nodes.length);

        return {
            x: x,
            y: y
        }
}

// need to know which node is in which layer, to avoid having to search through all layers
var nodeDict = {};


var links = [];
// var linkDict = {"source": {}, "target": {}}; // maps nodes to links for fading
var sourceDict = {}
var targetDict = {}


var fade = function(id, opacity, turnOff, groupToFade) {
    // todo: improve performance, by reducing to a dict look-up, hence no loops in selector
    var turnOff = typeof turnOff === "undefined" ? true : turnOff;
    var groupToFade = typeof groupToFade === "undefined" ? null : groupToFade;

    if (turnOff) {
        svg.selectAll(".node, .link")
            .style("opacity", opacity); // initialize to 0

        var intermediateNodes = []; 
    }

    var sources = sourceDict[id];
    var targets = targetDict[id];
    var group = layerDict[id]; // first item is the group name...

    // for now, no difference between source -> target and target -> source
    var combined = _.union(sources.slice(1), targets.slice(1), [id]);

    if (groupToFade) {
        var nodeFilter = function(d) {
            return _.includes(combined, d.id)
                && layerDict[d.id] === groupToFade
        };

        var linkFilter = function(d) {
            return (d.source.id === id || d.target.id === id)
                && (layerDict[d.source.id] === groupToFade || layerDict[d.target.id] === groupToFade);
        };
    } else {
        var nodeFilter = function(d) {
            return _.includes(combined, d.id)
        };

        var linkFilter = function(d) {
            return d.source.id === id || d.target.id === id;
        };
    }

    var filteredNodes = svg.selectAll(".node")
        .filter(nodeFilter)
        .style("opacity", 1)

    var filteredLinks = svg.selectAll('.link')
        .filter(linkFilter)
        .style("opacity", 1)


    if (group !== "intermediaries") {
        _.forEach(combined, function(id) {
            if (layerDict[id] === "intermediaries") {
                var groupToFade = group === "sources" ? "targets" : "sources";
                intermediateNodes.push(fade(id, opacity, false, groupToFade)) // also fade-in intermediate nodes and link connections
            }
        })
    }

    return groupToFade ? filteredNodes.data() : _.flatten(intermediateNodes);
}

var numLinks = function(id) {
    return sourceDict[id].length + targetDict[id].length
}

var getLinks = function(id) {
    return _.union(sourceDict[id].slice(1), targetDict[id].slice(1));
}

// Links are global
var addLink = function(source, target, update) {
    update = typeof update === "undefined" ? true : false;

    var source = source.split(":");
    var target = target.split(":");

    var sourceGroup = source[0];
    var sourceId = source[1];
    var targetGroup = target[0];
    var targetId = target[1];

    var sourceNode = groups[source[0]].findNode(source[1]),
        targetNode = groups[target[0]].findNode(target[1]);

    if (!sourceNode || !targetNode) {
        console.log("doesnt exist");
        return;  
    } 

    // update linkDict
    // source -> target
    sourceDict[sourceId].push(targetId);
    // target -> source
    targetDict[targetId].push(sourceId)


    links.push({
        source: sourceNode,
        target: targetNode,
        intermediate: {} // intermediate node for bezier curves
    });

    if (update) {
        updateLinks();
    }
}

var addLinks = function(links) {
    _.forEach(links, function(link) {
        addLink(link.source, link.target);
    })

    updateLinks();
}

var updateLinks = function() {
    var link = svg.selectAll(".link")
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
        .insert("path", ".node")
        .attr("id", function(d) {
            return d.source.id + "-" + d.target.id;
        })
        .attr("class", "link")
        .attr("d", diagonal)
        // .attr("class", "node" + this.uniqueSelector)

    link.exit().remove()

    // update node radius
    // todo: improve performance
    _.forEach(groups, function(group) {
        group.updateNodes();
    })


}

var clientWidth = Window.innerWidth || document.documentElement.clientWidth || document.getElementsByTagName('body')[0].clientWidth,
    clientHeight = Window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight

// todo: make responsive
var margin = {top: 50, right: 0, bottom: 50, left: 0},
    width = clientWidth - margin.left - margin.right,
    height = clientHeight - margin.top - margin.bottom;

var focusLock = false; // focusLock for tooltip

// zoom behaviour
var zoom = d3.behavior.zoom()
    .scaleExtent([0, 10])
    .on('zoom', function() {
        svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")"); 
    })

var drag = d3.behavior.drag()
    .on("dragstart", function(d) {
        d3.event.sourceEvent.stopPropagation();
        d3.event.sourceEvent.preventDefault();
    })    

var svg = d3.select("body")
    .append("svg")
    .call(drag)
    .on("click", function() {
        if (d3.event.defaultPrevented) return;
        focusLock = false;
        tip.hide();
        svg.selectAll('.node, .link').style("opacity", 1);

    })
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .call(zoom) // zoom behaviour on parent container
    .append('g')
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")


d3.select(window).on('resize', function() {
    // todo: resize windows appropriately
})

var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(sources, targets, intermediateConnections, d) {

    var sources = sources.slice(1);
    var targets = targets.slice(1);

    var sourcetargets = _.union(sources, targets);

    var nsources = [];
    var ntargets = [];

    var nintermediateconnections = intermediateConnections;

    var nintermediaries = [];
    var nunrelated = [];

    _.forEach(sourcetargets, function(item) {
        switch(sourceDict[item][0]) {
            case "sources":
                nsources.push(item)
                break;
            case "targets":
                ntargets.push(item)
                break;
            case "intermediaries":
                nintermediaries.push(item)
                break;
            case "unrelated":
                nunrelated.push(item)
                break;
        }
    });

    if (layerDict[d.id] === "sources") {
        ntargets = _.union(ntargets, _.map(nintermediateconnections, function(i) { return i.id }))
    } else if (layerDict[d.id] === "targets"){
        nsources = _.union(nsources, _.map(nintermediateconnections, function(i) { return i.id }))
    }

    var html = ""

    html +=("<b>" + d.id + "</b><br />")


    if (ntargets.length) {
        html += "<ul>"
        html += ("<b>Targets</b> <br><ul class='tip-targets'>")
        _.forEach(ntargets, function(source) {
            html += ("<li>" + source + "</li>")
        })
        html += ("</ul>")
    }

    // if (nintermediateconnections.length) {
    //     html += "<ul>"
    //     html += ("<b>Indirect " + (layerDict[d.id] === "sources" ? "targets" : "sources") + "</b> <br><ul class='tip-targets'>")
    //     _.forEach(nintermediateconnections, function(source) {
    //         html += ("<li>" + source.id + "</li>")
    //     })
    //     html += ("</ul>")
    // }

    if (nsources.length) {
        html += "<ul>"
        html += ("<b>Sources</b> <br><ul class='tip-sources'>")
        _.forEach(nsources, function(source) {
            html += ("<li>" + source + "</li>")
        })
        html += ("</ul>")
    }

    if (nintermediaries.length) {
        html += "<ul>"
        html += ("<b>Intermediaries</b> <br><ul class='tip-intermediaries'>")
        _.forEach(nintermediaries, function(source) {
            html += ("<li>" + source + "</li>")
        })
        html += ("</ul>")
    }

    if (nunrelated.length) {
        html += "<ul>"
        html += ("<b>Unrelated</b> <br><ul class='tip-unrelated'>")
        _.forEach(nunrelated, function(source) {
            html += ("<li>" + source + "</li>")
        })
        html += ("</ul>")
    }

    // // html += ("<b>Targets</b> <br><ul class='tip-targets'>")
    // _.forEach(targets.slice(1), function(source) {
    //     html += ("<li>" + source + "</li>")
    // })
    // html += ("</ul>")

    return html
  })

svg.call(tip);

// var groups = {
//     "unrelated1": new CircleContainer((width/3)/2, height/2, width/3, {
//         "uniqueNodeClass": "unrelated1"
//     }),
//     "unrelated2": new CircleContainer((width/3)/2, height/2, width/4, {
//         "uniqueNodeClass": "unrelated2"
//     }),
//     "unrelated3": new CircleContainer((width/3)/2, height/2, width/5, {
//         "uniqueNodeClass": "unrelated3"
//     }),
//     "sources": new LineContainer(width/3, height, width/3, height, {
//         "uniqueNodeClass": "sources"
//     }),
//     "intermediaries": new LineContainer((2*width)/3, height, (2*width)/3, height, {
//        "uniqueNodeClass": "intermediaries" 
//     }),
//     "targets": new LineContainer(width, height, width, height, {
//         "uniqueNodeClass": "targets"
//     })
// }

var circleWidth = width / 3;
var circleCenter = circleWidth / 2;

var lineWidth = (2 * width/3) / 3;
var lineOffset = lineWidth / 2;

var line1 = circleWidth + lineOffset;
var line2 = circleWidth + lineWidth + lineOffset;
var line3 = circleWidth + 2*lineWidth + lineOffset;

var groups = {
    "unrelated1": new CircleContainer(circleCenter, height/2, circleWidth/3, {
        "uniqueNodeClass": "unrelated1",
        "nodeGroup": "unrelated"
    }),
    "unrelated2": new CircleContainer(circleCenter, height/2, circleWidth/4, {
        "uniqueNodeClass": "unrelated2",
        "nodeGroup": "unrelated"
    }),
    "unrelated3": new CircleContainer(circleCenter, height/2, circleWidth/5, {
        "uniqueNodeClass": "unrelated3",
        "nodeGroup": "unrelated"
    }),
    "unrelated4": new CircleContainer(circleCenter, height/2, circleWidth/6, {
        "uniqueNodeClass": "unrelated4",
        "nodeGroup": "unrelated"
    }),
    "sources": new LineContainer(line1, height, line1, height, {
        "uniqueNodeClass": "sources",
        "nodeGroup": "sources"
    }),
    "intermediaries": new LineContainer(line2, height, line2, height, {
       "uniqueNodeClass": "intermediaries",
        "nodeGroup": "intermediaries"
    }),
    "targets": new LineContainer(line3, height, line3, height, {
        "uniqueNodeClass": "targets",
        "nodeGroup": "targets"
    })
}



groups["unrelated1"].draw(svg);
// groups["unrelated2"].draw(svg);
// groups["unrelated3"].draw(svg);
// groups["unrelated4"].draw(svg);
groups["sources"].draw(svg);
groups["targets"].draw(svg);
groups["targets"].draw(svg);

// groups["unrelated1"].addNode("Giorgi_Gogia")
// groups["unrelated1"].addNode("PRLTUN")
// groups["unrelated1"].addNode("ntbowdoin")
// groups["unrelated1"].addNode("1")
// groups["unrelated1"].addNode("2")
// groups["unrelated1"].addNode("3")
// groups["unrelated1"].addNode("4")
// groups["unrelated1"].addNode("5")
// groups["unrelated1"].addNode("6")
// groups["unrelated1"].addNode("7")

// groups["unrelated2"].addNode("8")
// groups["unrelated2"].addNode("9")
// groups["unrelated2"].addNode("10")
// groups["unrelated2"].addNode("11")
// groups["unrelated2"].addNode("12")

// groups["sources"].addNode("OCHA_CAR");
// groups["sources"].addNode("vincentduhem");
// groups["sources"].addNode("unicpretoria");
// groups["sources"].addNode("JigmeUgen");
// groups["sources"].addNode("UNICEF_CAR");

// groups["intermediaries"].addNode("CIVICUSalliance");
// groups["intermediaries"].addNode("marselhagm");
// groups["intermediaries"].addNode("justinforsyth");

// groups["targets"].addNode("Noy_Official");
// groups["targets"].addNode("FAOK12nowledge");
// groups["targets"].addNode("UNDPAfrica");
// groups["targets"].addNode("FCOMattBaugh");
// groups["targets"].addNode("robynleekriel");

// addLink("sources:OCHA_CAR", "targets:Noy_Official");
// addLink("sources:UNICEF_CAR", "targets:robynleekriel");
// addLink("sources:unicpretoria", "intermediaries:CIVICUSalliance");
// addLink("unrelated1:7", "sources:UNICEF_CAR");

var nodes = json.nodes;
var links = json.edges;

var layerMapping = {
    "0": "targets",
    "1": "intermediaries",
    "2": "sources",
    "3": "sources",
    "4": "unrelated1",
    "5": "unrelated1",
    "6": "unrelated1",
    "7": "unrelated1",
}

var layerDict = {}; // keep track of what layer the node with id x is in

var numUnrelated = 0;


var intermediaries = nodes.filter(function(node) {
    return layerMapping[node.LayerNo] === "intermediaries"
})

var rest = nodes.filter(function(node) {
    return layerMapping[node.LayerNo] !== "intermediaries"
})


// console.log(intermediaries)
// console.log(rest);

_.forEach(rest, function(node) {
    if (node.LayerNo > 7) {
        var layer = "unrelated1"
    } else {
        var layer = layerMapping[node.LayerNo];
    }

    // if(node.id === "ManonScharmay") {
    //     console.log('exists');
    // }

    groups[layer].addNode(node.id, {}, false);
    layerDict[node.id] = layer;
        
});

_.forEach(intermediaries, function(node) {
    var match = _.some(links, function(link) {
        return (link.source === node.id || link.target === node.id)
        && (layerDict[link.source] === "targets" || layerDict[link.target] === "targets");
    }) 

    if (!match) {
        // move to unrelated users
        groups["unrelated1"].addNode(node.id, {}, false);
        layerDict[node.id] = "unrelated1";
    } else {
        groups["intermediaries"].addNode(node.id, {}, false);
        layerDict[node.id] = "intermediaries";
    }
})

_.forEach(links, function(link) {
    var source = link.source;
    var target = link.target;

    var sourceLayer = layerDict[source];
    var targetLayer = layerDict[target];

    // console.log(sourceLayer);
    // console.log(source);
    // console.log(targetLayer);
    // console.log(target);

    addLink(sourceLayer + ":" + source, targetLayer + ":" + target, false);
})

_.forEach(groups, function(group) {
    group.updateNodes();
})

updateLinks();


