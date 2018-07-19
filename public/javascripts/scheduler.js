$(document).ready(function() {
	$('#dtpstart').datetimepicker({
		minDate: moment(),
		stepping: 30
	});
	$('#dtpend').datetimepicker({
		maxDate: moment().add(1, "years"),
		stepping: 30,
		useCurrent: false
	});
    $("#dtpstart").on("dp.change", function (e) {
        $('#dtpend').data("DateTimePicker").minDate(e.date);
    });
    $("#dtpend").on("dp.change", function (e) {
        $('#dtpstart').data("DateTimePicker").maxDate(e.date);
    });

    $("#checkout").on("click", function(e) {
    	var resArr = $(".lresource").map(function() {
    		return $(this).data("id");
    	}).get();

    	var start = $('#dtpstart').data("DateTimePicker").date();
    	var end = $('#dtpend').data("DateTimePicker").date();

    	// var formData = new FormData();
    	// formData.append('start', moment.utc(start).format("YYYY-MM-DD HH:mm:ss"));
    	// formData.append('end', moment.utc(end).format("YYYY-MM-DD HH:mm:ss"));
    	// formData.append('resources', resArr);
    	var data = {
    		start: moment.utc(start).format("YYYY-MM-DD HH:mm:ss"),
    		end: moment.utc(end).format("YYYY-MM-DD HH:mm:ss"),
    		resources: resArr
    	}
		$.ajax({
			url: '/api/rsvn/' + window.location.pathname.split("/").slice(-1)[0],
			type: 'POST',
			data: data,
			success: function(data) {
				alert("successfully reserved")
			},
			error: function() {

			}

		});

    	//console.log(resArr);
    });

	$('#calendar').fullCalendar({
		height: "parent",
		header: {
            left: 'prev,next today',
            center: 'title',
            right: 'timelineWeek,timelineMonth,timelineYear'
        },
        resourceAreaWidth: '20%',
        resourceRender: function(resourceObj, labelTds, bodyTds) {
        	labelTds.data(resourceObj)
        	labelTds.on("click", function() {
        		labelTds.toggleClass('selected');
        		updateSelectedList();
        	});
        },
		defaultView: 'timelineWeek',
		resources: '/api/rsvnresources',
		events: '/api/listreservations'

	});

});

function updateSelectedList() {
	$('ul.list-group').empty();
	$('.selected').each(function(index, element) {
		let id = $(element).data().id;
		let l = $('<li class="lresource">'+id+'</id>');
		l.data("id", id)
		l.appendTo($('ul.list-group'))
	})
}

function listActiveSlices() {
	$(".dropdown-menu").empty();
	
	if($("#withDropdown").hasClass("open")) return;

	//$('#flashmessage').text("loading...").show(0);
	$("<li>loading...</li>").appendTo(".dropdown-menu");
	$.get("/api/listactiveslices", function(result) {
		$(".dropdown-menu").empty();
		result.forEach(function(slicename) {
			var ele = $(`<li><a href='javascript:window.history.pushState("${slicename}", "", "/scheduler/${slicename}");'>${slicename}</a></li>`)
			ele.appendTo(".dropdown-menu")
		});
		//$('#flashmessage').text("loaded").hide(0);
	});
}

/*
	$("#calendar").fullCalendar({
		height: "parent",
		navLinks: true,
		selectable: true,
		selectHelper: true,
		selectOverlap: false,
		//selectOverlap: false,
		selectMinDistance: 13,
		allDayDefault: false,
		allDaySlot: false,
		selectAllow: function(selectInfo) {
			var duration = moment.duration(selectInfo.end.diff(selectInfo.start));
			return selectInfo.start > Date.now() && duration.asHours() <= 24;
		},
		select: function(start, end) {
			$("#addeventmodal").modal("toggle");
			$("#dtpstart").data("DateTimePicker").date(start);
			$("#dtpend").data("DateTimePicker").date(end);
			$("#calendar").fullCalendar("unselect");
		},
		eventLimit: true,
		events: {
			url: "/u/api/events"
		},
		timezone: "local",

		customButtons: {
			toDashboard: {
				text: "Dashboard",
				click: function() {
					window.location = "/u/dashboard";
				}
			},
			toggleList: {
				text: "list",
				click: function() {
					var currentView = $("#calendar").fullCalendar('getView').type;
					if ($(".fc-toggleList-button").hasClass("fc-state-active")) { // if in list view
						$("#calendar").fullCalendar("option", { header: { left: "toDashboard agendaDay,agendaWeek,month,toggleList,viewMyEvents" } });
						if (currentView === "listDay") {
							$("#calendar").fullCalendar("changeView", "agendaDay");
						} else if (currentView === "listWeek") {
							$("#calendar").fullCalendar("changeView", "agendaWeek");
						} else if (currentView === "listMonth") {
							$("#calendar").fullCalendar("changeView", "month");
						}
					} else {
						$("#calendar").fullCalendar("option", { header: { left: "toDashboard listDay,listWeek,listMonth,toggleList,viewMyEvents" } });
						if (currentView === "agendaDay") {
							$("#calendar").fullCalendar("changeView", "listDay");
						} else if (currentView === "agendaWeek") {
							$("#calendar").fullCalendar("changeView", "listWeek");
						} else if (currentView === "month") {
							$("#calendar").fullCalendar("changeView", "listMonth");
						}
					}
					updateStates("toggleList");
				}
			},
			viewMyEvents: {
				text: "my events",
				click: function() {
					if ($(".fc-viewMyEvents-button").hasClass("fc-state-active")) { // if in 'my events' view
						$("#calendar").fullCalendar("option", "eventRender", function() {} );
					} else {
						$("#calendar").fullCalendar("option", "eventRender", function(event) { return event.group === GROUP; } );
					}
					updateStates("viewMyEvents");
				}
			},
			newEvent: {
				text: "add event",
				click: function() {
					$("#addeventmodal").modal("toggle");
				}
			},
			manage: {
				text: "manage events",
				click: function() {
					$("#manageeventsmodal").modal("toggle");
				}
			}
		},
		header: {
			left: "toDashboard agendaDay,agendaWeek,month,toggleList,viewMyEvents",
			center: "title",
			right: "newEvent,manage today prev,next"
		}
	});

	//- MANAGE MODAL
	$("#manageeventsmodal").on("show.bs.modal", function() {
		var toManage = $("#calendar").fullCalendar("clientEvents").filter(function(e) { return e.group === GROUP; });
		$("#managetable").empty();
		var train = "<tbody>";
		toManage.forEach(function(event) {
			train += "<tr><td>" + new Date(event.start).toLocaleString() + "</td><td>" + event.title + "</td>";
			train += "<td><span class='glyphicon glyphicon-trash' id='" + event.id + "'></span></td>";
			train += "<tr>";
		});
		train += "</tbody>";
		$("#managetable").append(train);
	});
	$("#managetable").on("click", "span.glyphicon-trash", function(e) {
		$('#manageeventalert').text('deleting...').show(0);
		if(confirm("Are you sure you want to delete this event?")) {
			$.ajax({
				type: 'DELETE',
				url: '/u/api/events/'+e.target.id,
				success: function() {
					$('#manageeventalert').text('success').show(0).delay(5000).hide(0);
				},
				error: function() {
					console.log("error");
					$('#manageeventalert').text("error").show(0).delay(5000).hide(0);
				},
				complete: function() {
					$('#calendar').fullCalendar('refetchEvents');
					$("#manageeventsmodal").modal("show"); // soft refresh					
				}
			});
		}
	});

	//- DATETIMEPICKER
	$("#dtpstart").datetimepicker({
		minDate: moment(),
		stepping: 30
	});
	$("#dtpend").datetimepicker({
		maxDate: moment().add(1, "years"),
		stepping: 30,
		useCurrent: false
	});

	$("#dtpstart").on("dp.change", function(e) {
		$("#dtpend").data("DateTimePicker").minDate(e.date);
	});
	$("#dtpend").on("dp.change", function(e) {
		$("#dtpstart").data("DateTimePicker").maxDate(e.date);
	});

});

// closure to emulate private variables
// This function merely toggles and updates the active states of the buttons
var updateStates = (function() {
	var states = {
		toggleList: false,
		viewMyEvents: false
	};

	return function(toggle) {
		states[toggle] = !states[toggle];
		$(".fc-toggleList-button").toggleClass("fc-state-active", states.toggleList);
		$(".fc-viewMyEvents-button").toggleClass("fc-state-active", states.viewMyEvents);
	};
})();
*/