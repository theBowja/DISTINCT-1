var SVGGRAPH = function() {
	"use strict";

	// init for delete selected nodes/links functionality
	d3.select("#svgfocus")
		.on("keydown", function() {
			switch (d3.event.keyCode) {
				case 27: // ESCAPE - for deselecting everything
					d3.selectAll("#nodes .selected").classed("selected", false);
					d3.selectAll("#links .selected").classed("selected", false);
					control.selections.deselectsource();
					break;
				case 46: // DELETE
					if (!control.canCreate) break;
					control.selections.deletenodes();
					control.selections.deletelinks();
					control.selections.deletesource();
			}
		});

	var svg = d3.select("svg")
				.on("mousemove", linkdragmousemove);

	var width = parseFloat(svg.style("width"), 10);
	var height = parseFloat(svg.style("height"), 10);

	// for zooming
	var zoom = d3.zoom()
		.scaleExtent([1 / 10, 20])
		.on("zoom", zoomed);
	svg.append("rect")
		.attr("id", "background")
		.attr("width", width)
		.attr("height", height)
		.style("fill", "none")
		.style("pointer-events", "all")
		.call(zoom)
		.on("dblclick.zoom", null)
		.on("dblclick", function() {
			if (!control.canCreate) return;

			var point = d3.mouse(this);
			var transform = d3.zoomTransform(this);
			var newnodes = simulation.nodes();
			var tmpnode = {
				"name": "n-" + (Math.random().toString(36)+'00000000000000000').slice(2, 7+2), // TODO: guarantee that this string is a unique name
				"shape": control.toolshape,
				"nodetype": "XO Medium",
				"image": "https://www.google.com",
				"x": (point[0] - transform.x)/transform.k,
				"y": (point[1] - transform.y)/transform.k
			};
			newnodes.push(tmpnode);

			updateNodes(newnodes);
			tick();
		})
		.on("contextmenu", function() {
			
		}) // "contextmenu" would be for right click
		;
	var g = svg.append("g");
	function zoomed() {
		g.attr("transform", d3.event.transform);
	}

	var control = { // controls for the simulation: play/pause, cursor type, etc.
		canPlay: false, // default: false; it is paused
		updateMediaButton: function(state) {
			if (state === undefined || typeof state !== 'boolean') state = this.canPlay;
			if (state === true) {
				d3.select("#media-path").attr("d", "M6 19h4V5H6v14zm8-14v14h4V5h-4z"); // pause icon
				d3.select("#media-title").text("Currently running (click here to pause force simulation)");
				simulation.alpha(0.3).restart();
			} else if (state === false) {
				d3.select("#media-path").attr("d", "M8 5v14l11-7z"); // play icon
				d3.select("#media-title").text("Currently paused (click here to resume force simulation)");
				simulation.stop();
			}
			tick(); // puts nodes/links into their expected places
		},
		canCreate: false, // default: false; cannot create/delete nodes/links
		updateInteractionButton: function(state) {
			if (state === undefined || typeof state !== 'boolean') state = this.canCreate;
			if (state === true) {
				d3.select("#interaction-path").attr("d", "M17,13H13V17H11V13H7V11H11V7H13V11H17M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"); // circle plus icon
				d3.select("#interaction-title").text("Create node (DOUBLE CLICK)/link (SHIFT+CLICK two nodes) or remove a selected node/link (DELETE)");
				d3.select("#toolBoundBox").attr("height", 72); // shows shape
			} else if (state === false) {
				d3.select("#interaction-path").attr("d", "M10,2A2,2 0 0,1 12,4V8.5C12,8.5 14,8.25 14,9.25C14,9.25 16,9 16,10C16,10 18,9.75 18,10.75C18,10.75 20,10.5 20,11.5V15C20,16 17,21 17,22H9C9,22 7,15 4,13C4,13 3,7 8,12V4A2,2 0 0,1 10,2Z"); // drag cursor icon
				d3.select("#interaction-title").text("Drag node/link or edit its properties (DOUBLE CLICK)");
				d3.select("#toolBoundBox").attr("height", 48); // hides shape
				control.selections.deselectsource();
			}
			// regular mouse pointer icon; maybe to implement a selection tool
			//.attr("d", "M13.64,21.97C13.14,22.21 12.54,22 12.31,21.5L10.13,16.76L7.62,18.78C7.45,18.92 7.24,19 7,19A1,1 0 0,1 6,18V3A1,1 0 0,1 7,2C7.24,2 7.47,2.09 7.64,2.23L7.65,2.22L19.14,11.86C19.57,12.22 19.62,12.85 19.27,13.27C19.12,13.45 18.91,13.57 18.7,13.61L15.54,14.23L17.74,18.96C18,19.46 17.76,20.05 17.26,20.28L13.64,21.97Z")
			// move icon; probably useless
			//.attr("d", "M13,6V11H18V7.75L22.25,12L18,16.25V13H13V18H16.25L12,22.25L7.75,18H11V13H6V16.25L1.75,12L6,7.75V11H11V6H7.75L12,1.75L16.25,6H13Z")
		},
		shapes: ["circle", "cross", "diamond", "square", "star", "triangle", "wye"],
		toolshape: 0, // index of the array above
		getShape: function(s) { // defaults to 0: circle
			switch (typeof s) {
				case "number":
					return d3.symbols[s >= 0 && s <= 6 ? s : 0];
				case "string":
					var index = this.shapes.indexOf(s.toLowerCase());
					return d3.symbols[index !== -1 ? index : 0];
				default:
					return d3.symbols[0];
			}
		},
		selections: { // TODO: should really make these their own functions
			deletenodes: function() {
				var seldats = d3.selectAll("#nodes .selected, .selectlinksource").data();
				var newnodes = simulation.nodes();
				var newlinks = simulation.force("link").links();
				newnodes = newnodes.filter(function(dn) { // filters out any selected node
					for (var i = 0; i < seldats.length; i++) { // TODO: see if this triple-nested loop may have performance issues on large graphs
						if (dn.name === seldats[i].name) {
							newlinks = newlinks.filter(function(sn) { // filters out any links connected to the selected node
								return (dn.name !== sn.source.name && dn.name !== sn.target.name);
							});
							return false;
						}
					}
					return true;
				});
				updateNodes(newnodes);
				updateLinks(newlinks);
			},
			deletelinks: function() {
				var seldats = d3.selectAll("#links line.selected").data();
				var newlinks = simulation.force("link").links();
				newlinks = newlinks.filter(function(d) { // filters out any selected link
					return seldats.every(function(s) {
						return d.source.name !== s.source.name || d.target.name !== s.target.name;
					});			
				});
				updateLinks(newlinks);
			},
			source: undefined, // stores selection except when undefined
			deselectsource: function() {
				if (typeof this.source !== "undefined")
					this.source.classed("selectlinksource", false);
				this.source = undefined;
			},
			deletesource: function() {
				if (typeof this.source !== "undefined") {
					var srcname = this.source.datum().name;
					var newnodes = simulation.nodes();
					newnodes = newnodes.filter(function(dn) {
						return srcname !== dn.name; // TODO: delete associated links
					});
					updateNodes(newnodes);

					this.source = undefined;
				}
			},
			canZoom: true // unimplemented
		},
	};
	OPTIONSPANEL = OPTIONSPANEL(control.shapes);

	var nodes = [];
	var links = [];

	var simulation = d3.forceSimulation()
		.force("link", d3.forceLink().distance(60).id(function(d) { return d.name; })) // force link with id specified
		.force("charge", d3.forceManyBody().strength(-100))
		.force("attractForce", d3.forceManyBody().strength(500).distanceMin(800))
		.force("repelForce", d3.forceManyBody().strength(-200).distanceMax(60))
		.force("center", d3.forceCenter(width/2,height/2)) // force center
		.on('tick', tick);

	// link before node because of rendering order
	var link = g.append("g")
		.attr("id", "links")
		.selectAll("line");
	var draglink = g.append("line")
		.attr("id", "draglink")
		.attr("visibility", "collapse");
	draglink.datum({source:null, target:{}});
	var node = g.append("g")
		.attr("id", "nodes")
		.selectAll("path");

	updateNodes(nodes);
	updateLinks(links);

	var form = g.append("g")
	 	.attr("id", "forms");

	var toolBox = svg.append("g")
		.attr("id", "toolbox")
		.attr("transform", "translate(10,10)");
	initToolbar(toolBox); // idk conventions for init

	//////////// HERE BEGINS ALL THE FUNCTIONS //////////////

	// TODO: combine updateNodes() and updateLinks() into a single update() function
	/**
	 * Replaces the nodes of the simulation so that it is reflected on the svg
	 * @param nodes
	*/
	function updateNodes(nodes) {
		node = node.data(nodes, function(d){return d.name;}); // join new data with old elements
		node.exit().remove(); // remove unused elements
		// var nodenew = node.enter().append("path") // acts on new elements
		// 	.attr("d", d3.symbol()
		// 		.size(function(d) { return d.size || 256; })
		// 		.type(function(d) { return control.getShape(d.shape); }))
		//  	.attr("fill", function(d) { return d.color; })
		var nodenew = node.enter().append("g")
			.on("click", selectNode)
			.on("dblclick", function(d) {
				// Conditions to not open the options panel
				if (d3.event.shiftKey && control.canCreate) return;
				OPTIONSPANEL.create(d, this);
			})
			.call(d3.drag()
				.on("start", dragstarted)
				.on("drag", dragged)
				.on("end", dragended));	
		nodenew.append("image")
			.attr("xlink:href", "https://www.emulab.net/protogeni/jacks-stable/images/router.svg")
			.attr("x", -20)
			.attr("y", -20)
			.attr("width", "40px")
			.attr("height", "40px");
		nodenew.append("circle")
			.attr("cx", 0)	
			.attr("cy", 0)
			.attr("r", 25)
			.attr("fill", "none");
		nodenew.append("text")
			.attr("text-anchor", "middle")
			.attr("x", 0)
			.attr("y", 23)
			.attr("font-family", "sans-serif")
			.attr("font-size", "11px")
			.text(function(d) { return d.name; });

		nodenew.append("title") // allows us to see name when a node is moused over
			.text(function(d) { return d.name; });
		node = nodenew.merge(node); // merge with existing elements

		simulation.nodes(nodes);
		if (control.canPlay) simulation.alphaTarget(0.3).restart();
	}

	function updateLinks(links) {
		link = link.data(links, function(d){return d.source.name + "--" + d.target.name;}); // join
		link.exit().remove(); // remove
		link = link.enter().append("line") // append new
			.on("click", selectLink)
			.merge(link); // merge with old

		simulation.force("link").links(links);
		if (control.canPlay) simulation.alphaTarget(0.3).restart();
	}

	function selectNode() {
		var seltarget = d3.select(this);
		//console.log(seltarget.datum())

		// special selection for creating link
		if (d3.event.shiftKey && control.canCreate) {
			if (!seltarget.classed("selectlinksource")) { // selecting
				if (draglink.datum().source === null) { // selecting
					draglink.datum().source = seltarget.datum();
					tick(); // updates the svg once
					draglink.attr("visibility", "visible");
					seltarget.classed("selectlinksource", true);
					//control.selections.source = seltarget;
				} else { // creating a link (addlink)
					var newlinks = simulation.force("link").links();

					// search for if link already exists
					var sourcename = draglink.datum().source.name;
					var targetname = seltarget.datum().name;
					var notexist = newlinks.findIndex( function(d) {
						return d.source.name===sourcename&&d.target.name===targetname ||
							   d.source.name===targetname&&d.target.name===sourcename;
					}) === -1;
					if (notexist) { // if link doesn't already exist, then create link
						newlinks.push({
							source: draglink.datum().source,
							target: seltarget.datum()
						});
						updateLinks(newlinks);
						tick();
					}
					deselectLinkSource();
				}
			} else { // deselecting
				deselectLinkSource();
			}				
		} else { // general selection
			seltarget.classed("selected", !seltarget.classed("selected"));
		}
	}

	/* Deselects the source of draglink */
	function deselectLinkSource() {
		draglink.datum().source = null;
		tick();
		draglink.attr("visibility", "collapse");
		d3.select(".selectlinksource").classed("selectlinksource", false);
	}

	function selectLink() {
		var sel = d3.select(this);
		sel.classed("selected", !sel.classed("selected"));
	}

	function initToolbar(toolBox) {
		// makes a clipping of the outline which we'll use to cut off extraneous background
		var clip = toolBox.append("defs").append("clipPath")
			.attr("id", "toolclipBox");
		clip.append("rect")
			.attr("id", "toolBoundBox")
			.attr("width", 24)
			.attr("height", 48)
			.attr("rx", 5)
			.attr("ry", 5)
			.style("fill", "none")
			.style("stroke", "black")
			.style("stroke-width", 2);
		clip.append("rect")
			.attr("id", "shapesBoundBox")
			.attr("transform", "translate(24,48)")
			.attr("width", 24*control.shapes.length)
			.attr("height", 24)
			.attr("rx", 5)
			.attr("ry", 5)
			.attr("visibility", "collapse")
			.style("fill", "none");
			//.style("stroke", "black")
			//.style("stroke-width", 2);

		toolBox.attr("clip-path", "url(#toolclipBox)");

		// MEDIA ICON
		var mediabutton = toolboxButtonMaker("media","translate(0,0)");
		mediabutton.on("click", function() { // when user clicks this, this function alternates media symbols
			control.canPlay = !control.canPlay;
			control.updateMediaButton();
		});
		control.updateMediaButton();

		// INTERACTION ICON - drag/edit properties vs. create/delete
		var interactionbutton = toolboxButtonMaker("interaction","translate(0,24)");
		interactionbutton.on("click", function() { // when user clicks this, it alternates levels of interactivity
				control.canCreate = !control.canCreate;
				control.updateInteractionButton();
		});
		control.updateInteractionButton();

		// SHAPE MENU - allows you to choose what shape is created when you double-click background
		var shapebutton = toolboxButtonMaker("shape","translate(0,48)");
		shapebutton.on("click", function() { // when user clicks this, it opens up a shape menu
			var shapesMenu = d3.select("#shapesBoundBox");
			if (shapesMenu.attr("visibility") === "visible") {
				shapesMenu.attr("visibility", "collapse");
			} else {
				shapesMenu.attr("visibility", "visible");
			}
		});
		shapebutton.select("title")
			.text("Click here to open shapes menu");
		shapebutton.select("path")
			.attr("transform", "translate(12,12)")
			.attr("d", d3.symbol()
				.size(150)
				.type(control.getShape(control.toolshape)));
		initShapeMenu(shapebutton);

		// make visible the actual outline we used
		toolBox.append("use")
			.attr("href", "#toolBoundBox")
			.style("stroke-width", 1); // actual stroke-width := min(this.stroke-width, clip.stroke-width)
		toolBox.append("use")
			.attr("href", "#shapesBoundBox")
			.style("stroke-width", 1);
	}

	function initShapeMenu() {
		for (var i = 0; i < control.shapes.length; i++) {
			var shapebutton = toolboxButtonMaker(control.shapes[i],"translate("+(24*(i+1))+",48)");
			shapebutton.on("click", function() {
				var name = control.shapes[i];
				return function () {
					control.toolshape = name;
					d3.select("#shape-path")
						.attr("transform", "translate(12,12)")
						.attr("d", d3.symbol()
							.size(150)
							.type(control.getShape(name)));
					//d3.select("#shapesBoundBox").attr("visibility", "collapse");
				};
			}());
			shapebutton.select("title")
				.text(control.shapes[i]);
			shapebutton.select("path")
				.attr("transform", "translate(12,12)")
				.attr("d", d3.symbol()
					.size(150)
					.type(d3.symbols[i]));
		}
	}

	// one function to create them all!
	function toolboxButtonMaker(name,transform) {
		var custombutton = toolBox.append("g")
			.attr("class", "toolbox-button")
			.attr("transform", transform);
		custombutton.append("title")
			.attr("id", name + "-title");
		custombutton.append("rect")
			.attr("class", "toolbox-box")
			.attr("width", 24)
			.attr("height", 24)
			.attr("shape-rendering", "crispEdges");
		custombutton.append("path")
			.attr("id", name + "-path");
		return custombutton;
	}

	function tick() {
		node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

		console.log(d3.select(link).datum())
		link.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; });

		if(draglink.datum().source !== null)
			draglink.attr("x1", function(d) { return d.source.x; })
				    .attr("y1", function(d) { return d.source.y; })
				    // .attr("x2", function(d) { return d.target().x; })
				    // .attr("y2", function(d) { return d.target().y; });
	}

	function dragstarted(d) {
		if (control.canPlay && !d3.event.active) simulation.alphaTarget(0.3).restart(); // heats the simulation if it is running
		d.fx = d.x;
		d.fy = d.y;
	}

	function dragged(d) {
		d.fx = d3.event.x;
		d.fy = d3.event.y;

		if (!control.canPlay) { // if paused
			d.x = d3.event.x;
			d.y = d3.event.y;
			tick(); // TODO: update only affected nodes and links rather than everything
		}	
	}

	function dragended(d) {
		if (control.canPlay && !d3.event.active) simulation.alphaTarget(0);
		d.fx = null;
		d.fy = null;
	}

	/* 
	*/
	function linkdragmousemove() {
		var point = d3.mouse(this);
		var transform = d3.zoomTransform(d3.select("#background").node());

		draglink.attr("x2", (point[0] - transform.x)/transform.k)
				.attr("y2", (point[1] - transform.y)/transform.k);
	}

	function svg_clear() {
		d3.select("#jsontextarea").property("value", JSON.stringify({"nodes":[],"links":[]}));
		//SVGGRAPH.svg_import();
	}

	function svg_import() {
		var data;
		try {
			data = JSON.parse(d3.select("#jsontextarea").property("value"));
		} catch (e) { // ERR: not a valid json
			console.error("IMPORT: not a valid json");
			return;
		}

		var ajv = Ajv({ $data: true, allErrors: true});
		// var ajv = Ajv({ $data: true, allErrors: true, removeAdditional: true});
		ajv.addKeyword('containsNodeName', { $data:true, "validate": function (schema, data, parentSchema, currentDataPath, parentDataObject, parentProperty, rootData) {
			for (let node of rootData.nodes) { // not supported in all browsers
				if( node.name === data)
					return true;
			}
			return false;
		}, "errors": false });
		var schema = topologySchema;
		var validate = ajv.compile(schema);
		var valid = validate(data);
		if (!valid) {
			console.error("IMPORT: invalid format: " + ajv.errorsText(validate.errors));
			return;
		}
		
		// The || operator can be used to fill in default values:
		var importObject = data;

		// clear existing graph
		updateNodes([]);
		updateLinks([]);

		updateNodes(importObject.nodes);
		updateLinks(importObject.links);

		// resets zoom and translate (recenters)
		d3.select("#background").call(zoom.transform, d3.zoomIdentity);

		simulation.tick();
		tick();
	}

	function svg_export() {
		var exportObj = {};
		exportObj.version = "0.0.1";
		exportObj.toponame = $('#fileName').val();
		//console.log(node.data());
		exportObj.nodes = JSON.parse(JSON.stringify(node.data()));
		// remove excessive stuff from exportObj.nodes
		for(var i = 0; i < exportObj.nodes.length; i++) {
			exportObj.nodes[i].x = +exportObj.nodes[i].x.toFixed(2);
			exportObj.nodes[i].y = +exportObj.nodes[i].y.toFixed(2);
			delete exportObj.nodes[i].vx;
			delete exportObj.nodes[i].vy;
			delete exportObj.nodes[i].index;
			if (exportObj.nodes[i].fx === null)
				delete exportObj.nodes[i].fx;
			if (exportObj.nodes[i].fy === null)
				delete exportObj.nodes[i].fy;
		}
		console.log(node.data());

		exportObj.links = [];
		for( var i = 0; i < link.data().length; i++) {
			exportObj.links.push({"source":link.data()[i].source.name, "target":link.data()[i].target.name});
		}

		d3.select("#jsontextarea").property("value", JSON.stringify(exportObj));
	}

	// stuff we are exposing
	return {
		svg_clear: svg_clear,
		svg_import: svg_import,
		svg_export: svg_export
	};

};