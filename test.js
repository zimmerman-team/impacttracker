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

    // todo: replace by passing class name in constructor
    this.uniqueSelector = LineContainer.instanceCount++;

}

LineContainer.instanceCount = 0;

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

LineContainer.prototype.addNode = function(id, data) {
    this.nodes.push({
        "id": id,
        "data": data
    })

    // initialize source and target dict
    if (!sourceDict.hasOwnProperty(id)) sourceDict[id] = []; // check probaply not nescessary
    if (!targetDict.hasOwnProperty(id)) targetDict[id] = [];

    this.updateNodes(); // the order here matters
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
        // todo: return max links in the graph
        return 5;
    })

    // todo: better scale
    // var radius_scale = d3.scale.pow().exponent(0.5).domain([0, max_amount]).range([1, 2]);
    var radius_scale = d3.scale.linear().domain([0, max_amount]).range([5, 25]);

    var node = svg.selectAll(".node" + this.uniqueSelector) // todo: use options.className
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
            var numLinks = sourceDict[d.id].length + targetDict[d.id].length;
            return radius_scale(numLinks)
        })

    // add new
    node.enter()
        .append("circle")
        // .attr("r", 20)
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        })
        .attr("class", "node node" + this.uniqueSelector + " " + this.options.nodeClass) // todo: add as html5 data- attribute to identify
        .on("mouseover", function(d) {
            fade(d.id, 0.2);

            // get links
            var sources = sourceDict[d.id];
            var targets = targetDict[d.id];

            tip.show(sources, targets);
        })
        .on("mouseout", function(d) {
            svg.selectAll('.node, .link').style("opacity", 1);
            tip.hide(d);
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

    // todo: replace by passing class name in constructor
    this.uniqueSelector = CircleContainer.instanceCount++;
}

CircleContainer.prototype = new LineContainer(); // inherit some methods; we overwrite most of them
CircleContainer.instanceCount = 0;

CircleContainer.prototype.draw = function(parent) {
    this.instance = parent.append("circle")
        .attr("cx", this.cx)
        .attr("cy", this.cy)
        .attr("r", this.r)
        .attr("stroke-opacity", 0.3)
        .style("stroke", "red")
        .style("fill", "none")
}

CircleContainer.prototype.getCoords = function(i) {
    var degree = 360 / (this.nodes.length),
        rad = (Math.PI / 180) * degree,
        irad = rad * i;
        x = Math.floor(this.cx + Math.cos(irad) * this.r),
        y = Math.floor(this.cy + Math.sin(irad) * this.r)

        // console.log(i)
        // console.log(this.nodes.length + 1)
        // console.log(degree)

        // console.log(x);
        // console.log("newx: " + this.cx);

        // console.log(y);
        // console.log("newy: " + this.cy);

        return {
            x: x,
            y: y
        }
}



var links = [];
// var linkDict = {"source": {}, "target": {}}; // maps nodes to links for fading
var sourceDict = {}
var targetDict = {}


var fade = function(id, opacity) {
    // todo: improve performance, by reducing to a dict look-up, hence no loops in selector

    var sources = sourceDict[id];
    var targets = targetDict[id];

    // for now, no difference between source -> target and target -> source
    var combined = _.union(sources, targets, [id]);

    // show connected nodes
    var node = svg.selectAll(".node")
    
    node.style("opacity", function(d) {
        return _.includes(combined, d.id) ? 1 : opacity
    })

    // show connecting links
    var link = svg.selectAll('.link')

    link.style("opacity", function(d) {
        return d.source.id === id || d.target.id === id ? 1 : opacity
        // console.log(d);
    })


    // _.forEach(combined, function(neighbour, index) {

    // });

}

// Links are global
var addLink = function(source, target) {
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
    // sourceDict[sourceId].length > 0 ? sourceDict[sourceId].push(targetId) : sourceDict[sourceId] = [targetId]
    // target -> source
    // targetDict[targetId].length > 0 ? targetDict[targetId].push(sourceId) : targetDict[targetId] = [sourceId]
    targetDict[targetId].push(sourceId)


    links.push({
        source: sourceNode,
        target: targetNode,
        intermediate: {} // intermediate node for bezier curves
    });

    updateLinks();
}

var updateLinks = function() {
    var link = svg.selectAll(".link")
        .data(links, function (d) {
            return d.source.id + d.target.id;
        })

    //update
    link
        .transition()
        // .attr("d", function(d) {
        //     return "M" + d.source.x + "," + d.source.y
        //         + "S" + d.intermediate.x + "," + d.intermediate.y
        //         + " " + d.target.x + "," + d.target.y;
        //     });
        .attr("x1", function(d) {
            return d.source.x
        })
        .attr("y1", function(d) {
            return d.source.y
        })
        .attr("x2", function(d) {
            return d.target.x
        })
        .attr("y2", function(d) {
            return d.target.y
        })

    // console.log(link)

    // new links
    link.enter()
        .insert("line", ".node")
        .attr("id", function(d) {
            return d.source.id + "-" + d.target.id;
        })
        .attr("x1", function(d) {
            return d.source.x
        })
        .attr("y1", function(d) {
            return d.source.y
        })
        .attr("x2", function(d) {
            return d.target.x
        })
        .attr("y2", function(d) {
            return d.target.y
        })
        .attr("class", "link")
        // .attr("class", "node" + this.uniqueSelector)

    // console.log(link)

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
var margin = {top: clientHeight / 10, right: clientWidth / 10, bottom: clientHeight / 10, left: clientWidth / 10},
    width = clientWidth - margin.left - margin.right,
    height = clientHeight - margin.top - margin.bottom;

// zoom behaviour
var zoom = d3.behavior.zoom()
    .scaleExtent([0, 10])
    .on('zoom', function() {
        svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")"); 
    })

var svg = d3.select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .call(zoom) // zoom behaviour on parent container
    .append('g')
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

d3.select(window).on('resize', function() {
    // todo: resize windows appropriately
})

// todo: don't use third-party library for this, create a separate module
var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(sources, targets) {

    var html = ""

    html += ("Sources: <br><ul>")
    _.forEach(sources, function(source) {
        html += ("<li>" + source + "</li>")
    })
    html += ("</ul>")

    html += ("Targets: <br><ul>")
    _.forEach(targets, function(source) {
        html += ("<li>" + source + "</li>")
    })
    html += ("</ul>")

    return html
    // return "<strong>Item:</strong> <span style='color:red'>" + d.id+ "</span>";
  })

svg.call(tip);

var groups = {
    "unrelated1": new CircleContainer((width/3)/2, height/2, height/2, {
        "nodeClass": "unrelated"
    }),
    // "unrelated2": new CircleContainer((width/3)/2, height/2, height/3, {
    //     "nodeClass": "unrelated"
    // }),
    // "unrelated3": new CircleContainer((width/3)/2, height/2, height/5, {
    //     "nodeClass": "unrelated"
    // }),
    // "unrelated": new LineContainer(0, height, 0, height, {
    //     "nodeClass": "unrelated"
    // }),
    "sources": new LineContainer(width/3, height, width/3, height, {
        "nodeClass": "sources"
    }),
    "intermediaries": new LineContainer((2*width)/3, height, (2*width)/3, height, {
       "nodeClass": "intermediaries" 
    }),
    "targets": new LineContainer(width, height, width, height, {
        "nodeClass": "targets"
    })
}

groups["unrelated1"].draw(svg);
// groups["unrelated2"].draw(svg);
// groups["unrelated3"].draw(svg);
groups["sources"].draw(svg);
groups["targets"].draw(svg);
groups["targets"].draw(svg);

groups["unrelated1"].addNode("Giorgi_Gogia")
groups["unrelated1"].addNode("PRLTUN")
groups["unrelated1"].addNode("ntbowdoin")
groups["unrelated1"].addNode("1")
groups["unrelated1"].addNode("2")
groups["unrelated1"].addNode("3")
groups["unrelated1"].addNode("4")
groups["unrelated1"].addNode("5")
groups["unrelated1"].addNode("6")
groups["unrelated1"].addNode("7")

groups["sources"].addNode("OCHA_CAR");
groups["sources"].addNode("vincentduhem");
groups["sources"].addNode("unicpretoria");
groups["sources"].addNode("JigmeUgen");
groups["sources"].addNode("UNICEF_CAR");

groups["intermediaries"].addNode("CIVICUSalliance");
groups["intermediaries"].addNode("marselhagm");
groups["intermediaries"].addNode("justinforsyth");

groups["targets"].addNode("Noy_Official");
groups["targets"].addNode("FAOK12nowledge");
groups["targets"].addNode("UNDPAfrica");
groups["targets"].addNode("FCOMattBaugh");
groups["targets"].addNode("robynleekriel");

addLink("sources:OCHA_CAR", "targets:Noy_Official");
addLink("sources:UNICEF_CAR", "targets:robynleekriel");
addLink("sources:unicpretoria", "intermediaries:CIVICUSalliance");
// addLink("unrelated:Giorgi_Gogia", "intermediaries:CIVICUSalliance");

// line.addNode();

// var node = svg.selectAll('.node'),
//     link = svg.selectAll('.link');

