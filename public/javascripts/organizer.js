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

function sliceVerifyDelete(slicename) {
	if (confirm("You are about to delete " + slicename + ". Are you sure?")) {
		var formdata = new FormData();
		formdata.append('sslcert', $('#sslcert')[0].files[0] );
		$.ajax({

			url: 'api/ahab/'+slicename,
			type: 'DELETE',
			data: formdata,
			processData: false,
			contentType: false,
			success: function() {
				$('#ssl').submit();
				alert('success delete');
			},
			error: function() {
				alert('error delete');
			}
		});
	}
}

function listslices(list) {
	$('#activeslicelist').empty();
	var ele = d3.select('#activeslicelist').selectAll('div').data(list)
		.enter().append('div');
	ele.append('button')
		.attr('class', 'btn btn-default btn-sm custom-button')
		.attr('type', 'button')
		.attr('title', 'delete')
		.attr('onclick', function(d) { return 'sliceVerifyDelete("'+d.slicename+'")'; })
		.append('span')
			.attr('class','glyphicon glyphicon-trash');
	ele.append('a')
		.attr('href', function(d) { return 'slicestatus/'+d.slicename; })
		.text(function(d) { return d.slicename; });
    /* for(let slicename of list) {

      console.log(slicename);
      $("<a href='api/topo/'>"+slicename+"</a>").appendTo("div").appendTo('#slicelist')
    } */
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
