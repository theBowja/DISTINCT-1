$(document).ready(function() {
	$('#resform').on('submit', function(e) {

		var data = $('#resform').serialize();

		// $.post('/api/addresource', data, function(a,d) {
		// 	console.log(a, d);
		// });

		$.ajax({
			type: 'POST',
			url: '/api/addresource',
			data: data,
			success: function() {
				console.log('success');
			},
			error: function() {
				console.log('error');
			},
			complete: function() {
				window.location.reload(false); 
			}
		});
		return false;
		// return false;
	});


});

function resoVerifyDelete(Id, resname) {
	if (confirm("You are about to delete " + resname + ". Are you sure?")) {
		$.ajax({
			url: 'api/deleteresource/'+Id,
			type: 'DELETE',
			success: function() {
				alert('success delete');
				window.location.reload(false); 
			},
			error: function() {
				alert('error delete');
			}
		});
	}
}
