// This global object OPTIONSPANEL will be initialized
//   after the initialization of control in svgeditor.js.
//   It is passed in a string array of shapes that can be created.
var OPTIONSPANEL = (function (shapes) {
	// "base", ["circle", "cross", "diamond", "square", "star", "triangle", "wye"]

	// copy pasted from svgeditor.js
	// Returns the string of the shape
	function getShape(s) { // defaults to 0: circle
		switch (typeof s) {
			case "number":
				return shapes[s >= 0 && s <= 6 ? s : 0];
			case "string":
				var index = shapes.indexOf(s.toLowerCase());
				return shapes[index !== -1 ? index : 0];
			default:
				return shapes[0];
		}
	}

	// this is the schema example of how to create editable properties
	//   "update" is not required but "label" and "type" is
	var base = [
		{
			label: "name",
			type: "input",
			update: function(formdata, node, panel) {
				node.select("title").text(formdata);
				panel.select(".panel-title").text(formdata);
			}
		}, {
			label: "color",
			type: "select",
			options: ["black", "blue", "green", "grey"],
			update: function(formdata, node) {
				node.attr("fill", formdata);
			}
		}
	];

	var circle = base.concat([]);
	var cross = base.concat([]);
	var diamond = base.concat([]);
	var square = base.concat([
		{
			label: "blahblahblah",
			type: "textarea",
		}
	]);
	var star = base.concat([]);
	var triangle = base.concat([]);
	var wye = base.concat([]);

	var everything = {circle: circle, cross: cross, diamond: diamond, square: square, star: star, triangle: triangle, wye: wye};


	function createNodeOptionsPanel(d, node, canCreate) {
		var shapedNode = node;
		var shape = getShape(d.shape);

		// if options panel is already open, then it'll close again. (or do nothing)
		if (d3.select(shapedNode).classed("optionsopen")) {
			// TODO: fire the close node options panel event
			return;
		}

		d3.select(shapedNode).classed("optionsopen", true);

		//var transform = d3.zoomTransform(d3.select("#background").node());
	
		var foreignObject = d3.select("#forms")
			.append("foreignObject")
			.attr("class", "panel")
			.attr("x", d.x)
			.attr("y", d.y)
			.attr("width", "300px")
			.attr("height", "275px"); // required for firefox because width/height does not map from css
		var panel = foreignObject.append("xhtml:div")
			.attr("class", "panel-default");
		// HEADER
		var panel_header = panel.append("div")
			.attr("class", "panel-heading")
			.call(d3.drag()
				.container(shapedNode.parentNode.parentNode) // sets the container of drag to the transform element
				.filter( dragFilterNodeOptionsPanel)
				.on("drag", function() { dragNodeOptionsPanel(foreignObject); }) ); // drag panel
		var panel_header_close = panel_header.append("span")
			.attr("class", "close-custom")
			.datum("undraggable")
			.html("&times;")
			.on("click", function() { closeNodeOptionsPanel(shapedNode,foreignObject); });
		var panel_header_title = panel_header.append("span")
			.attr("class", "panel-title")
			//.datum("undraggable")
			.text(d.name);


		// CONTENT
		var panel_content = panel.append("div")
			.attr("class", "panel-body");
			// .append("div").attr("class", "container");

		var form = panel_content.append("form")
			//.attr("class", "form-horizontal")
			.attr("autocomplete", "off")
			.on("submit", function() { updateNodeOptionsPanel(panel,d3.select(shapedNode),shape); });
		form.append("input") // this is a phantom input. this allows the form to be submitted when "enter" is pressed
			.attr("type", "submit")
			.style("display", "none");

		// make all the elements of the form (input/select/whatever)
		everything[shape].forEach( function(trait) {
			var subform = form.append("div")
				.attr("class", "form-group");
			subform.append("label")
				.attr("class", "control-label")
				.text(trait.label+":");
			var fcon = subform.append(trait.type)
				.attr("class", "form-control")
				.attr("id", trait.label); // the form is id'd as the label name (ie "name"/"color")
			switch(trait.type) {
				case("input"): 
					fcon.attr("type", "text")
						.attr("value", d[trait.label]);
					break;
				case("select"):
					fcon.selectAll("option").data(trait.options).enter().append("option")
						.text(function(opt) { return opt; });
					break;
				case("textarea"):
					fcon.property("value", d[trait.label]);
					break;
				default:
			}
		});

		// FOOTER
		var panel_footer = panel.append("div")
			.attr("class", "panel-footer");

		var form_submit = panel_footer.append("button")
			.attr("class", "btn btn-default btn-sm")
			.attr("type", "submit")
			.on("click", function() { updateNodeOptionsPanel(panel,d3.select(shapedNode),shape); })
			.text("Save changes");	        	
	}

	function dragFilterNodeOptionsPanel(d,i) {
		return d3.select(d3.event.target).datum()!="undraggable" && !d3.event.button; // !d3.event.button was default
	}

	function dragNodeOptionsPanel(foreignObject) {
		foreignObject.attr("x", +foreignObject.attr("x") + d3.event.dx);
		foreignObject.attr("y", +foreignObject.attr("y") + d3.event.dy);
	}

	// form and shapedNode are selections
	function updateNodeOptionsPanel(panel, shapedNode, shape) {
		d3.event.preventDefault(); // prevents page from refreshing
		var form = panel.select("form");

		var original = shapedNode.datum();
		everything[shape].forEach( function(trait) {
			var formdata = form.select("#"+trait.label).property("value");
			if (original[trait.label] !== formdata) {
				original[trait.label] = formdata;
				if (trait.update)
					trait.update(formdata, shapedNode, panel);
			}
		});
	}

	function closeNodeOptionsPanel(circleNode,foreignObject) {
		d3.select(circleNode).classed("optionsopen", false);
		foreignObject.remove();
	}

	return {
		create: createNodeOptionsPanel,
	};
});