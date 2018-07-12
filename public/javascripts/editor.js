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

$('textarea').keydown(function(e){
	if(e.keyCode == 13) {
		e.preventDefault();
		return false;
	}
})

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
function savetopo(data) {
	$.ajax({
		type: 'POST',
		url: '/api/topo/' + "#{topoloc}", // last segment of url
		data: { jsontopo: data },
		success: function() { 
			$('#flashmessage').text("success").show(0).delay(3500).hide(0);
		},
		error: function() {
			$('#flashmessage').text("incorrect format").show(0).delay(3500).hide(0);
		}
	});
}

$('#reservebutton').on('click', function(e) {
	e.preventDefault();
	$('#flashmessage').text('reserving resouce').show(0);
	window.location.href = '/reserve/' + "#{topoloc}";
	//$.ajax({
	//	type: 'GET',
	//	url: '/reserve/' + "#{topoloc}" 
	//})

});

$('#exportbutton').on('click', function(e) {
	e.preventDefault();
	d3.select("#jsontextarea").property("value", SVGGRAPH.svg_export());
});