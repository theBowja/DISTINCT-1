var TOPOLOC = window.location.pathname.split("/").slice(-1)[0];

function listAttachments() {
	var drop = d3.select("#withDropdown");
	// if it is already open, then destroy the dropdown list
	if (drop.classed("open")) { 
		drop.select(".dropdown-menu").html(null);
	} else { // if dropdown is not open, then get the list of attachments and show it
		//$('#flashmessage').text("loading...").show(0);
		$.get("/api/listtopologies", function(result) {
			drop.select(".dropdown-menu").selectAll("li").data(result)
				.enter().append("li").append("a")
					.attr("href", function(d) { return "/createslice/" + d.location; })
					.attr("tabindex", "-1")
					.text(function(d) { return d.toponame; });
			//$('#flashmessage').text("loaded").hide(0);
		});
	}
}

$(document).ready(function(){

	$('form#upload').submit(function(e) {
		e.preventDefault();
		// check if have both pem and pub uploaded
		var pemfile = $('#pem')[0].files[0];
		var pubfile = $('#pub')[0].files[0];
		if(!pemfile && $('#pemname').text() === '')
			return $('#flashmessage').text('need pemfile').show(0).delay(3500).hide(0);
		if(!pubfile && $('#pubname').text() === '')
			return $('#flashmessage').text('need pubfile').show(0).delay(3500).hide(0);

		// upload keys and then call api for creating a slice
		var formData = new FormData();
		if(pemfile !== undefined)
			formData.append('pem', pemfile);
		if(pubfile !== undefined)
			formData.append('pub', pubfile);
		$.ajax({
			url: '/uploadkeys',
			type: 'POST',
			data: formData,
			success: function(data) {
				$('#flashmessage').text('upload success. creating slice... (please wait)').show(0);

				$.ajax({
					url: '/api/createslice/' + TOPOLOC,
					type: 'POST',
					data: { isDelayed: $('#isDelayed').is(':checked')},
					success: function() {
						$('#flashmessage').text('create success').show(0);
						window.location = '/organizer';
					},
					error: function() {
						alert('internal server error')
						$('#flashmessage').text('internal server error').show(0).delay(3500).hide(0);
					}
				});
			},
			error: function() {
				$('#flashmessage').text('internal server error').show(0).delay(3500).hide(0);
			},
			cache: false,
			contentType: false,
			processData: false
		});
	});

});