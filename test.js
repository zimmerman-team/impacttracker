/*
    Graph test    
*/

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
    // console.log((this.y2 / this.nodes.length))

    if ((this.y2 / this.nodes.length) < 10) {
        this.y1 -= ((this.y2 - this.y1) / 4)   
        this.y2 += ((this.y2 - this.y1) / 4)   
        // console.log(this.y2 / this.nodes.length)
    }


    return {
        x: this.x1,
        y: this.y1 + ((Math.abs(this.y1) + this.y2) / this.nodes.length) * i 
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

LineContainer.prototype.updateNodes = function(cb) {
    var self = this;

    _.forEach(this.nodes, function(node, i) {
        var coords = self.getCoords(i);

        if(node.id === "PRLTUN")
            console.log(coords)

        node.x = coords.x* 1 / Math.sqrt(Math.sqrt(zoom.scale()));
        node.y = coords.y;
        node.fixed = true;
    });

    var max_amount = d3.max(this.nodes, function(d) {
        return nodeScale === "log" ? Math.logBase(10, maxLinks) : maxLinks  
    })

    // todo: better scale
    // var radius_scale = d3.scale.pow().exponent(0.5).domain([0, max_amount]).range([1, 2]);
    var linear_radius_scale = d3.scale.linear().domain([0, max_amount]).range([2, 25]);
    var log_radius_scale = d3.scale.log().clamp(true).domain([1, max_amount]).range([2, 25]);

    var nodeGroup = svg.selectAll("." + this.options.uniqueNodeGroupClass) // todo: use options.className
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
        // .append("g")
        // .append("circle")
        .attr("class", "node") // todo: add as html5 data- attribute to identify
        .attr("r", function(d) {
            var thisLinks = numLinks(d.id);
            if (thisLinks > maxLinks) maxLinks = thisLinks; 
            // console.log(Math.logBase(10, thisLinks))
            // console.log(radius_scale(Math.logBase(10, thisLinks)))

            return nodeScale === "log" ? log_radius_scale(Math.logBase(10, thisLinks)) : linear_radius_scale(thisLinks)
        })
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        })
        .on("mouseover", function(d) {
            if (!focusLock) {
                var intermediateConnections = fade(d.id, 0.1);
				selectedIntermediateConnections = intermediateConnections;

                // get links
                var sources = sourceDict[d.id];
                var targets = targetDict[d.id];


                d3.selectAll('.node-depth-selection').on("change", function() {
                    console.log(this);
                })
				showIndirect = "checked";
                return tip.show(sources, targets, intermediateConnections, d);
            }
        })
        .on("click", function(d) {
            focusLock = true;
            d3.event.stopPropagation();
        })
        .on("mouseout", function(d) {
            if (!focusLock) {
                svg.selectAll('.nodeGroup, .link').style("opacity", 1);
                if (!textToggle) svg.selectAll('.nodeText').style("opacity", 0);
                tip.hide(d);
            }
        })

    var label = nodeGroup.select("text")
        .attr("class", "nodeText")
        .attr("dx", function(d) {
            // todo: get radius directly from circle
            return nodeScale === "log" ? log_radius_scale(Math.logBase(10, numLinks(d.id))) + 5 : linear_radius_scale(numLinks(d.id)) + 5
        })
        .attr("dy", ".35em")
        .attr("opacity", 0)
        .text(function(d) {
            return d.id;
        })
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        })

    // exit selection
    nodeGroup.exit().remove()

    if (cb) cb();

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

        return {
            x: x,
            y: y
        }
}

// need to know which node is in which layer, to avoid having to search through all layers
var nodeDict = {};


var maxLinks = 0; // the biggest node size
var links = [];

// var linkDict = {"source": {}, "target": {}}; // maps nodes to links for fading
var sourceDict = {}
var targetDict = {}
var fade = function(id, opacity, indirect, turnOff, groupToFade) {

    var indirect = typeof indirect === "undefined" ? true : indirect;
    var turnOff = typeof turnOff === "undefined" ? true : turnOff;
    var groupToFade = typeof groupToFade === "undefined" ? null : groupToFade;

    if (turnOff) {
        svg.selectAll(".nodeGroup, .link")
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

    var filteredNodes = svg.selectAll(".nodeGroup")
        .filter(nodeFilter)
        .style("opacity", 1);

    filteredNodes.select("text")
        .style("opacity", 1)

    var filteredLinks = svg.selectAll('.link')
        .filter(linkFilter)
        .style("opacity", 1)


    if (indirect && group !== "intermediaries") {
        _.forEach(combined, function(id) {
            if (layerDict[id] === "intermediaries") {
                var groupToFade = group === "sources" ? "targets" : "sources";
                intermediateNodes.push(fade(id, opacity, true, false, groupToFade)) // also fade-in intermediate nodes and link connections
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
            if(d.target.id === "PRLTUN")
                console.log(d.target.y)
            return {"x": d.source.y, "y": d.source.x };
        })
        .target(function(d) {
            return {"x": d.target.y, "y": d.target.x};
        })
        .projection(function(d) {
            return [d.y, d.x]
        })

    // todo: nodes in same group: curved line
    // var line = d3.svg.line()
    //     .x(function(d) { console.log(d); return d.x })
    //     .y(function(d) { return d.y })
    //     .interpolate("linear")

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
    .scaleExtent([0.2, 10])
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
        svg.selectAll('.nodeGroup, .link').style("opacity", 1);
        if (!textToggle) svg.selectAll('.nodeText').style("opacity", 0);



    })
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("overflow", "visible")
    .call(zoom) // zoom behaviour on parent container
    .append('g')
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")


d3.select(window).on('resize', function() {
    // todo: resize windows appropriately
})

var textToggle = false;
var nodeScale = "linear" 

// toggle node text
d3.select("input").on("change", function() {
    if (this.checked) {
        svg.selectAll(".nodeText").style("opacity", 1);
        textToggle = true;
    } else {
        svg.selectAll(".nodeText").style("opacity", 0);
        textToggle = false;
    }
});

// toggle scale
d3.selectAll('input[name="scale"]').on("change", function() {
    switch(this.value) {
        case "linear":
            nodeScale = "linear";
            break;
        case "log":
            nodeScale = "log";
            break;
    }

    _.forEach(groups, function(group) {
        group.updateNodes();
    })
})

var selectedNode;
var selectedEvent;
var showIndirect;
var selectedIntermediateConnections;
// todo: bad method, change this
var depthChanged = function() {
    var selection = d3.selectAll('.node-depth-selection')

    var indirect = selection[0][0].checked
    var id = selection[0][0].attributes["data-id"].value;
	if(indirect) {
		showIndirect = "checked";
	} else {
		showIndirect = "";
	}
    console.log(selection[0][0].attributes["data-id"].value)
    fade(id, 0.1, indirect)
	// get links
	var sources = sourceDict[id];
	var targets = targetDict[id];
	var test = "testt";
	console.log(test);
	tip.show(sources, targets, selectedIntermediateConnections, selectedNode);



    // if (direct && !indirect)
}

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}


// todo: remove this dependency or rewrite to d3 select notation
var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(sources, targets, intermediateConnections, d) {
    console.log(sources);
	selectedNode = d;
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

    // if (layerDict[d.id] === "sources") {
    //     ntargets = _.union(ntargets, _.map(nintermediateconnections, function(i) { return i.id }))
    // } else if (layerDict[d.id] === "targets"){
    //     nsources = _.union(nsources, _.map(nintermediateconnections, function(i) { return i.id }))
    // }

    var html = ""

    html +=("<b><a href=\"" + "https://twitter.com/"+d.id + "\">" + d.id + "</a>"  + "</b><br />")
    html += ("<input onchange=\"depthChanged()\" class=\"node-depth-selection\" type=\"checkbox\" data-id=\"" + d.id + "\" "+ showIndirect + "> 2nd Degree Relations")
	
	var uniqueDirectTargets = ntargets.filter( onlyUnique );
	var uniqueTargets = ntargets.filter( onlyUnique );
	var directTargetsReachedByNode = uniqueDirectTargets.length;
	var indirectTargetsReachedByNode = 0;
		

	
	if(layerDict[d.id] === "sources") {
		var uniqueIndirectTargets = nintermediateconnections.filter( onlyUnique );
		_.forEach(uniqueIndirectTargets, function(source) {
			if(!_.contains(uniqueTargets, source.id)) {
				uniqueTargets.push(source.id);
			}
        })
		
		indirectTargetsReachedByNode = uniqueIndirectTargets.length;
	}
	
	var uniqueDirectSources = nsources.filter( onlyUnique );
	var uniqueSources = nsources.filter( onlyUnique );
	if(layerDict[d.id] !== "sources") {
		var uniqueIndirectSources = nintermediateconnections.filter( onlyUnique );
		_.forEach(uniqueIndirectSources, function(source) {
			if(!_.contains(uniqueSources, source.id)) {
				uniqueSources.push(source.id);
			}
        })
	}
	
	var targetsReachedByNode = uniqueTargets.length;
	
	var nodeSuccessRate = targetsReachedByNode / totalNumberOfTargets * 100;
	nodeSuccessRate = nodeSuccessRate.toFixed(2);
	
	var nodeDirectSuccessRate = directTargetsReachedByNode / totalNumberOfTargets * 100;
	nodeDirectSuccessRate = nodeDirectSuccessRate.toFixed(2);
	
	var nodeIndirectSuccessRate = indirectTargetsReachedByNode / totalNumberOfTargets * 100;
	nodeIndirectSuccessRate = nodeIndirectSuccessRate.toFixed(2);

	
	html +=("<b>Total Target Reach: " + nodeSuccessRate + "%</b><br />")
	html +=("<b>Direct Target Reach: " + nodeDirectSuccessRate + "%</b><br />")
	html +=("<b>Indirect Target Reach: " + nodeIndirectSuccessRate + "%</b><br />")

    // d3.select("input[name=''').on("change", function() {
    //     if (this.checked) {
    //         svg.selectAll(".nodeText").style("opacity", 1);
    //         textToggle = true;
    //     } else {
    //         svg.selectAll(".nodeText").style("opacity", 0);
    //         textToggle = false;
    //     }
    // });
	
	var selection = d3.selectAll('.node-depth-selection')
	if (typeof selection[0][0] !== "undefined") {
		var indirect = selection[0][0].checked;
	} else {
		var indirect = true;
	}
	
	if(!indirect) {
	
		uniqueTargets = uniqueDirectTargets;
	}
    if (uniqueTargets.length) {
		console.log(uniqueTargets);
		uniqueTargets.sort(function (a, b) {
			return a.toLowerCase().localeCompare(b.toLowerCase());
		});
        html += "<ul>"
        html += ("<b>Targets</b> <br><ul class='tip-targets'>")
        _.forEach(uniqueTargets, function(source) {
            html += ("<li>" + source + "</li>")
        })
        html += ("</ul>")
    }

		if(!indirect) {
			uniqueSources = uniqueDirectSources;
		}
    if (uniqueSources.length) {
		uniqueSources.sort(function (a, b) {
			return a.toLowerCase().localeCompare(b.toLowerCase());
		});
        html += "<ul>"
        html += ("<b>Sources</b> <br><ul class='tip-sources'>")
        _.forEach(uniqueSources, function(source) {
            html += ("<li>" + source + "</li>")
        })
        html += ("</ul>")
    }

    if (nintermediaries.length) {
		var uniqueIntermediaries = nintermediaries.filter( onlyUnique );
		uniqueIntermediaries.sort(function (a, b) {
			return a.toLowerCase().localeCompare(b.toLowerCase());
		});
        html += "<ul>"
        html += ("<b>Intermediaries</b> <br><ul class='tip-intermediaries'>")
        _.forEach(uniqueIntermediaries, function(source) {
            html += ("<li>" + source + "</li>")
        })
        html += ("</ul>")
    }

    if (nunrelated.length) {
		var uniqueUnrelated = nunrelated.filter( onlyUnique );
		uniqueUnrelated.sort(function (a, b) {
			return a.toLowerCase().localeCompare(b.toLowerCase());
		});
        html += "<ul>"
        html += ("<b>Unrelated</b> <br><ul class='tip-unrelated'>")
        _.forEach(uniqueUnrelated, function(source) {
            html += ("<li>" + source + "</li>")
        })
        html += ("</ul>")
    }

    return html
  })

svg.call(tip);

var circleWidth = width / 3;
var circleCenter = circleWidth / 2;

var lineWidth = (2 * width/3) / 3;
var lineOffset = lineWidth / 2;

var line1 = circleWidth + lineOffset;
var line2 = circleWidth + lineWidth + lineOffset;
var line3 = circleWidth + 2*lineWidth + lineOffset;

var groups = {
    "unrelated1": new CircleContainer(circleCenter, height/2, circleWidth/3, {
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
    "sources": new LineContainer(line1, 0, line1, height, {
        "uniqueNodeGroupClass": "sources",
        "nodeGroup": "sources"
    }),
    "intermediaries": new LineContainer(line2, 0, line2, height, {
       "uniqueNodeGroupClass": "intermediaries",
        "nodeGroup": "intermediaries"
    }),
    "targets": new LineContainer(line3, 0, line3, height, {
        "uniqueNodeGroupClass": "targets",
        "nodeGroup": "targets"
    })
}

groups["unrelated1"].draw(svg);
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

var targetNodes = nodes.filter(function(node) {
    return layerMapping[node.LayerNo] === "targets"
})
var sourceNodes = nodes.filter(function(node) {
    return layerMapping[node.LayerNo] === "sources"
})

var rest = nodes.filter(function(node) {
    return layerMapping[node.LayerNo] !== "intermediaries"
})

_.forEach(rest, function(node) {
    if (node.LayerNo > 7) {
        var layer = "unrelated1"
    } else {
        var layer = layerMapping[node.LayerNo];
    }

    groups[layer].addNode(node.id, {}, false);
    layerDict[node.id] = layer;
        
});

var totalNumberOfNodes = nodes.length;
var totalNumberOfNonSourceNodes = totalNumberOfNodes-sourceNodes.length;
var totalNumberOfTargets = targetNodes.length;
var precisionRate = totalNumberOfTargets/totalNumberOfNonSourceNodes*100;
precisionRate = precisionRate.toFixed(2);

var element = document.getElementById("info-box2");

var successRate = "--"; //TODO calculate real successRate
var successDiv = document.createElement("div");
successDiv.innerHTML = "Success Rate<a href=\"#\" data-toggle=\"tooltip\" title=\"Targets reached divided by total targets\">(?)</a>: " + successRate + "%";
element.appendChild(successDiv);

var precisionDiv = document.createElement("div");
precisionDiv.innerHTML = "Precision Rate<a href=\"#\" data-toggle=\"tooltip\" title=\"Targets reached divided by total accounts reached\">(?)</a>: " + precisionRate + "%";
element.appendChild(precisionDiv);

$(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip();   
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
    if(link.source === "PRLTUN" || link.target === "PRLTUN")
        console.log(link)

    addLink(sourceLayer + ":" + source, targetLayer + ":" + target, false);
})

_.forEach(groups, function(group) {
    group.updateNodes();
})

// todo: make sure calling twice isnt nescessary
updateLinks();
updateLinks();


// async.each(groups, function(group, cb) {
//     group.updateNodes(cb);
// }, function(err) {
//     updateLinks();
//     updateLinks();
// })


function zoomed() {
    svg.attr("transform",
        "translate(" + zoom.translate() + ")" +
        "scale(" + zoom.scale() + ")"
    );
		_.forEach(groups, function(group) {
        group.updateNodes();
    })
	updateLinks();
}

function interpolateZoom (translate, scale) {
    var self = this;
    return d3.transition().duration(350).tween("zoom", function () {
        var iTranslate = d3.interpolate(zoom.translate(), translate),
            iScale = d3.interpolate(zoom.scale(), scale);
        return function (t) {
            zoom
                .scale(iScale(t))
                .translate(iTranslate(t));
            zoomed();
        };
    });
}

function zoomClick() {
    var clicked = d3.event.target,
        direction = 1,
        factor = 0.4,
        target_zoom = 1,
        center = [width / 2, height / 2],
        extent = zoom.scaleExtent(),
        translate = zoom.translate(),
        translate0 = [],
        l = [],
        view = {x: translate[0], y: translate[1], k: zoom.scale()};

    d3.event.preventDefault();
    direction = (this.id === 'zoom_in') ? 1 : -1;
    target_zoom = zoom.scale() * (1 + factor * direction);

    if (target_zoom < extent[0] || target_zoom > extent[1]) { return false; }

    translate0 = [(center[0] - view.x) / view.k, (center[1] - view.y) / view.k];
    view.k = target_zoom;
    l = [translate0[0] * view.k + view.x, translate0[1] * view.k + view.y];

    view.x += center[0] - l[0];
    view.y += center[1] - l[1];

    interpolateZoom([view.x, view.y], view.k);

}

zoom.on("zoomend", function(){

	_.forEach(groups, function(group) {
        group.updateNodes();
    })
	updateLinks();
})

d3.selectAll('button').on('click', zoomClick);
