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
	$('#starttime').datetimepicker({
		minDate: moment(),
		stepping: 30
	});
	$('#endtime').datetimepicker({
		maxDate: moment().add(1, "years"),
		stepping: 30,
		useCurrent: false
	});
    $("#starttime").on("dp.change", function (e) {
        $('#endtime').data("DateTimePicker").minDate(e.date);
    });
    $("#endtime").on("dp.change", function (e) {
        $('#starttime').data("DateTimePicker").maxDate(e.date);
    });

    // disable starttime input when "now" is checked
    $("#now").change(function() {
    	$("#starttime>input").prop('disabled', this.checked);
    });


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

				var slicename = $('#slicename').val(); // TODO: check for valid strings
				var now = $('#now').is(":checked");
		    	var start = $('#starttime').data("DateTimePicker").date();
		    	var end = $('#endtime').data("DateTimePicker").date();
				$.ajax({
					url: '/api/createslice/' + TOPOLOC,
					type: 'POST',
					data: {
						slicename: slicename,
						now: now,
						starttime: moment.utc(start).format("YYYY-MM-DD HH:mm:ss"),
						endtime: moment.utc(end).format("YYYY-MM-DD HH:mm:ss")
					},
					success: function() {
						$('#flashmessage').text('create success').show(0);
						window.location = '/organizer';
					},
					error: function() {
						alert('internal server error');
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