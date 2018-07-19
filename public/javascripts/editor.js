function listAttachments() {
	var drop = d3.select("#withDropdown");
	// if it is already open, then destroy the dropdown list
	if (drop.classed("open")) { 
		drop.select(".dropdown-menu").html(null);
	} else { // if dropdown is not open, then get the list of attachments and show it
		$('#flashmessage').text("loading...").show(0);
		$.get("/api/listtopologies", function(result) {
			drop.select(".dropdown-menu").selectAll("li").data(result)
				.enter().append("li").append("a")
					.attr("href", function(d) { return "/editor/" + d.location; })
					.attr("tabindex", "-1")
					.text(function(d) { return d.toponame; });
			$('#flashmessage').text("loaded").hide(0);
		});
	}
}

function savetopo(data) {
	$.ajax({
		type: 'POST',
		url: '/api/topo/' + window.location.pathname.split("/").slice(-1)[0], // last segment of url
		data: { jsontopo: data },
		success: function(topoloc) { 
			$('#flashmessage').text("success").show(0).delay(3500).hide(0);
			if(topoloc)
				window.history.pushState(topoloc, "", "/editor/"+topoloc);
		},
		error: function(xhr, status, text) {
			var message;
			if(xhr.status === 400)
				message = "incorrect format";
			else if(xhr.status === 403)
				message = "permission denied";
			else
				message = "internal server error";
			$('#flashmessage').text(message).show(0).delay(3500).hide(0);
		}
	});
}
 
$(document).ready(function(){
	$('#jsontextarea').keydown(function(e){
		if(e.keyCode == 13) {
			e.preventDefault();
			return false;
		}
	});

	$('#savetextareabutton').on('click', function(e) {
		e.preventDefault();
		$('#flashmessage').text("saving...").show(0);
		savetopo($('#jsontextarea').val());
	});
	$('#savesvgbutton').on('click', function(e) {
		e.preventDefault();
		$('#flashmessage').text("saving...").show(0);
		savetopo(SVGGRAPH.svg_export());
	});

	$('#createslicebutton').on('click', function(e) {
		e.preventDefault();
		var topoloc = window.location.pathname.split("/").slice(-1)[0]
		if(topoloc !== "editor")
			window.location.href = '/createslice/' + topoloc;
		else
			$('#flashmessage').text('...').show(0).delay(3000).hide(0);
	});

	$('#exportbutton').on('click', function(e) {
		e.preventDefault();
		d3.select("#jsontextarea").property("value", SVGGRAPH.svg_export());
	});

});