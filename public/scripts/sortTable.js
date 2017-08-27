// code taken from https://www.w3schools.com/howto/howto_js_sort_table.asp
// the code is modified to allow sorting of dates regardless of known formats
function sortTable(n) {
	var table, rows, switching, isDate, i, x, y, shouldSwitch, dir, switchcount = 0;
	table = document.getElementById("myTable2");
	isDate = false;
	// detects if we are sorting dates, of which we'll have to give special considerations
	if (table.getElementsByTagName("TH")[n].id == "datecreated" || table.getElementsByTagName("TH")[n].id == "lastlogin") {
		isDate = true;
	}
	switching = true;
	// Set the sorting direction to ascending:
	dir = "asc";
	/* Make a loop that will continue until no switching has been done: */
	while (switching) {
		// start by saying: no switching is done:
		switching  = false;
		rows = table.getElementsByTagName("TR");
		/* Loop through all table rows (except the first, which contains table headers): */
		for (i = 1; i < (rows.length - 1); i++) {
			// start by saying there shold be no switching:
			shouldSwitch = false;
			/* Get the two elements you want to compare, one from current row and one from the next: */
			x = rows[i].getElementsByTagName("TD")[n].innerHTML;
			y = rows[i + 1].getElementsByTagName("TD")[n].innerHTML;
			if (isDate) {
				// Convert the date into ISO format for easy compare/sorting
				// These series of try-catch blocks are for if the date provided to the constructor is invalid
				try {
					x = new Date(x).toISOString();
				} catch (e) {
					x = "";
				}
				try {
					y = new Date(y).toISOString();
				} catch (e) {
					y = "";
				}
			}

			/* check if the two rows should switch place, based on the direction, asc or desc: */
			if (dir == "asc") {
				if (x.toLowerCase() > y.toLowerCase()) {
					// if so, mark as a switch and break the loop:
					shouldSwitch = true;
					break;
				}
			} else if (dir == "desc") {
				if (x.toLowerCase() < y.toLowerCase()) {
					shouldSwitch = true;
					break;
				}
			}
		}
		if (shouldSwitch) {
			/* If a switch has been marked, make the switch and mark that a switch has been done */
			rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
			switching = true;
			// Each time a switch is done, increase this count by 1:
			switchcount++;
		} else {
			/* If no switching has been done AND the direction is "asc", set the direction to "desc" and run the while loop again. */
			if (switchcount === 0 && dir === "asc") {
				dir = "desc";
				switching = true;
			}
		}
	}


}