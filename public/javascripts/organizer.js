function topoVerifyDelete(fileName, fileloc) {
	if (confirm("You are about to delete " + fileName + ". Are you sure?")) {
		// success is called if ( status >= 200 && status < 300 || status === 304 )
		//- $.ajax({url:"organizer/"+fileloc, type:"DELETE", success: function(result) {
		//-   location.reload();
		//- }})
		var http = new XMLHttpRequest();
		var url = "api/topo/" + fileloc;
		http.open("DELETE", url, true);

		http.onreadystatechange = function() {//Call a function when the state changes.
			if(http.readyState == 4 && http.status == 200) {
				location.reload();
			}
		};
		http.send();
	}
}

function sliceVerifyDelete(slice) {
	if (confirm("You are about to delete " + slice.slicename + ". Are you sure?")) {
		var formdata = new FormData();
		$.ajax({
			url: 'api/deleteslice/'+slice.Id,
			type: 'DELETE',
			success: function() {
				alert('success delete');
			},
			error: function() {
				alert('error delete');
			}
		});
	}
}

function listslices(list) {
	listactiveslices( list.filter(slice => !slice.isDelayed) );
	listdelayedslices( list.filter(slice => slice.isDelayed) );
}

function listactiveslices(activeslices) {
	$('#activeslicelist').empty();
	var ele = d3.select('#activeslicelist').selectAll('div').data(activeslices)
		.enter().append('div');
	ele.append('button')
		.attr('class', 'btn btn-default btn-sm custom-button')
		.attr('type', 'button')
		.attr('title', 'delete')
		.on('click', sliceVerifyDelete)
		.append('span')
			.attr('class','glyphicon glyphicon-trash');
	ele.append('a')
		.attr('href', function(d) { return 'slicestatus/'+d.slicename; })
		.text(function(d) { return d.slicename; });	
}

function listdelayedslices(delayedslices) {
	$('#delayedslicelist').empty();
	var ele = d3.select('#delayedslicelist').selectAll('div').data(delayedslices)
		.enter().append('div');
	ele.append('button')
		.attr('class', 'btn btn-default btn-sm custom-button')
		.attr('type', 'button')
		.attr('title', 'delete')
		.on('click', sliceVerifyDelete)
		.append('span')
			.attr('class','glyphicon glyphicon-trash');
	ele.append('a')
		.attr('href', function(d) { return 'slicestatus/'+d.slicename; })
		.text(function(d) { return d.slicename; });	
}

$(document).ready(function() {
	$('<p>loading...</p>').appendTo('#slicelist');
	$.ajax({
		url: 'api/listslices',
		type: 'GET',
		success: function(data) {
			listslices(data);
		}, 
		error: function() {
			alert('error listslices');
		}
	});
});
