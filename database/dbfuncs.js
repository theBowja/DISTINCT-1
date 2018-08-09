var conn = require('./db.js');
var bcrypt = require('bcrypt');
var uuidv4 = require('uuid/v4');

var dbfuncs = {};


/** 
 * Verifies user login using params: username, plaintextpassword.
 * Use bcrypt to compare passwords.
 * Returns: a user object containing: id, username, role
 */
dbfuncs.login = function(username, password, callback) {
	conn.query('SELECT * FROM user WHERE username = ?;', username, function(err, results, fields) {
		if (err) return callback(err);
		if (results.length == 0) return callback("USER_NOT_FOUND");

		bcrypt.compare(password, results[0].password, function(err, res) {
			if (err) return callback("BCRYPT_ERR");
			if (!res) return callback("INCORRECT_PWD");
			// else user login success
			//   update lastlogin
			var user = {
				Id : results[0].Id,
				username : results[0].username,
				role: results[0].role
			};
			return callback(null, user);
		});
	});

};

/**
 * Creates a user in the database using params: username, email, and password.
 * This function hashes the password before inserting into the database.
 * Duplicate username is also checked and returns an error if there is.
 */
dbfuncs.createuser = function(username, email, password, role, callback) {
	bcrypt.hash(password, 10, function(err, hash) {
		var user = {
			username: username,
			email: email,
			password: hash,
			role: role
		};

		conn.query('INSERT INTO user SET ?', user, function(err, results, fields) {
			if (err) return callback(err);
			return callback(null, results);
		});
	});
	
};

/* ========================================================================================= */
/* ============================== DB FUNCTIONS: PERMISSION ================================= */
/* ========================================================================================= */

/**
 * @returns {object} permission object
 *
 */
dbfuncs.getPermission = function(userid, topoid, callback) {
	conn.query('SELECT * FROM permission WHERE userid=? AND topoid=?', [userid, topoid], function(err, results, fields) {
		if (err) return callback(err);
		if (results.length == 0) return callback("PERMISSION_NOT_FOUND");

		return callback(null, results[0]);
	});
};

/**
 * Gets the permission associated with the user and file location
 * @callback.err may be FILE_NOT_FOUND or PERMISSION_NOT_FOUND
 * @returns {object} permission object
*/
dbfuncs.getPermissionbyLocation = function(userid, location, callback) {
	dbfuncs.getIdbyLocation(location, function(err, fileid) {
		if (err) return callback(err);

		dbfuncs.getPermission(userid, fileid, function(err, data) {
			if (err) return callback(err);

			return callback(null, data);
		});
	});
};

/**
 * updates the permission associated with 
 */
dbfuncs.updatePermission = function(role, callback) {
	conn.query('UPDATE permission SET role = ? WHERE userid = ?', function(err, results, fields) {
		if (err) return callback(err);

		return call(null, data);
	});
};

/**
 * Gets the id associated with the file location.
 */
dbfuncs.getIdbyLocation = function(location, callback) {
	conn.query('SELECT Id FROM topology WHERE location = ?', location, function(err, results, fields) {
		if (err) return callback(err);
		if (results.length == 0) return callback("FILE_NOT_FOUND");

		return callback(null, results[0].Id);
	});
};

/* =================================================================================== */
/* ============================= DB FUNCTIONS: TOPOLOGY ============================== */
/* =================================================================================== */

/**
 * Gets the topology object based on topoid
 */
dbfuncs.getTopology = function(topoid, callback) {
	conn.query('SELECT * FROM topology WHERE Id = ?', topoid, function(err, results, fields) {
		if (err) return callback(err);

		return callback(null, results[0]);
	});
};

/**
 * Gets the topology object association with the location
 */
dbfuncs.getTopologybyLocation = function(location, callback) {
	conn.query('SELECT * FROM topology WHERE location = ?', location, function(err, results, fields) {
		if (err) return callback(err);

		return callback(null, results[0]);
	});
};

/**
 * Gets a list of all topologies the user has access to using: userid.
 * @returns {array} of objects. The objects are of format: { toponame: String, location: String }
 */
dbfuncs.listTopologies = function(userid, callback) {
	conn.query('SELECT topology.toponame, topology.location FROM permission, topology WHERE permission.userid = ? AND permission.topoid = topology.Id;', userid, function (err, results, fields) {
		if (err) return callback(err);

		return callback(null, results);
	});
};

/**
 * creates a topology and its corresponding permission with userid and toponame
 * if something fails, then it undos any changes made.
 * @returns {object} - the topology object (the object must have the 'location' key-value)
*/
dbfuncs.createTopology = function(userid, toponame, callback) {
	var topology = {
		toponame: toponame,
		location: uuidv4()
	};

	conn.beginTransaction(function(err) {
		if (err) return callback(err);

		conn.query('INSERT INTO topology SET ?', topology, function(err, results, fields) {
			if (err) conn.rollback(function() { return callback(err); });

			var permission = {
				userid: userid,
				role: 'owner',
				topoid: results.insertId
			};

			conn.query('INSERT INTO permission SET ?', permission, function(err, results, fields) {
				if (err) conn.rollback(function() { return callback(err); });

				conn.commit(function(err) {
					if (err) conn.rollback(function() { return callback(err); });
					return callback(null, topology);
				});
			});
		});	
	});
};

/**
 * Updates the topology. May change the fields for: toponame
 */
dbfuncs.updateTopology = function(topoid, toponame, callback) {
	conn.query('UPDATE topology SET toponame = ? WHERE Id = ?', [toponame, topoid], function(err, results, fields) {
		if (err) return callback(err);

		return callback(null, results);
	});
};

/**
 * Deletes the topology and its associated permissions
 */
dbfuncs.deleteTopology = function(topoloc, callback) {
	conn.query('DELETE topology, permission FROM topology INNER JOIN permission WHERE topology.location = ? AND topology.Id = permission.topoid', topoloc, function(err, results, fields) {
		return callback(err, results);
	});
};

/* =================================================================================== */
/* ============================== DB FUNCTIONS: SLICES =============================== */
/* =================================================================================== */

dbfuncs.listSlices = function(userid, callback) {
	conn.query('SELECT * FROM slice WHERE slice.userid = ?;', userid, function(err, results, fields) {
		return callback(err, results);
	});
};

dbfuncs.listActiveSlices = function(userid, callback) {
	conn.query('SELECT * FROM slice WHERE slice.userid = ? AND isDelayed = false;', userid, function(err, results, fields) {
		return callback(err, results);
	});
};

dbfuncs.listDelayedSlices = function(userid, callback) {
	conn.query('SELECT * FROM slice WHERE slice.userid = ? AND isDelayed = true;', userid, function(err, results, fields) {
		return callback(err, results);
	});
};

dbfuncs.addFile = function(filename, location, callback) {
	var file = {
		filename: filename,
		location : location
	};
	conn.query('INSERT INTO file SET ?', file, function(err, results, fields) {
		return callback(err, results);
	});
};

// TODO: use moment.js to increment expiration date by 1
/**
 * @param sliceobj {object} - must contain the properties: userid, slicename, isDelayed, toponame, topoloc,
 *                                                         pemname, pemloc, pubname, publoc, and expiration
 */
dbfuncs.addSlice = function(sliceobj, callback) {
	var properties = ['userid', 'slicename', 'isDelayed', 'topoloc', 'pemname', 'pemloc', 'pubname', 'publoc', 'expiration'];
	if(!properties.every(function(x) { return x in sliceobj; }))
		return callback('missing parameter(s)');

	conn.query('INSERT INTO slice SET ?', sliceobj, function(err, results, fields) {
		return callback(err, results);
	});
};

dbfuncs.deleteSlice = function(userid, sliceid, callback) {
	conn.query('DELETE FROM slice WHERE userid = ? AND Id = ?', [userid, sliceid], function(err, results, fields) {
		return callback(err, results);
	});
};

/**
 */
dbfuncs.getSlice = function(userid, sliceid, callback) {
	conn.query('SELECT * FROM slice WHERE userid = ? AND Id = ?', [userid, sliceid], function(err, results, fields) {
		return callback(err, results[0]);
	});
};

/* =================================================================================== */
/* ============================= DB FUNCTIONS: SCHEDULER ============================= */
/* =================================================================================== */

/**
 * lists all reservations
 * @returns {array} - of objects: { Id: {string}, resource: {array}, slicename: {string}, start: {string}, end: {string} }
 * the UTC times are returned in format: YYYY-MM-DD HH:MM:SS
 */
dbfuncs.listAllReservations = function(callback) {
	conn.query('SELECT * FROM reservation', function(err, results, fields) {
		if (err) return callback(err);
		var reservations = [];
		for(let r of results) {
			reservations.push({
				Id: r.Id,
				slicename: r.slicename,
				start: r.start,
				end: r.end
			});
		}
		return callback(null, reservations);
	});
};

/**
 * lists all reservations made by userid
 * @returns {array} - of objects
 * the UTC times are returned in format: YYYY-MM-DD HH:MM:SS
 */
dbfuncs.listUserReservations = function(userid, callback) {
	conn.query('SELECT reservation.Id, slice.topoloc, reservation.start, reservation.end FROM reservation, slice WHERE slice.userid = ? AND reservation.sliceid = slice.Id', userid, function(err, results, fields) {
		if (err) return callback(err);
		console.log(results);
		var reservations = [];
		for(let r of results) {
			reservations.push({
				Id: r.Id,
				slicename: r.slicename,
				start: r.start,
				end: r.end
			});
		}
		return callback(null, reservations);
	});
};

/**
 * @param resources {array} - of strings
 * @param slicename {string} -
 * @param start {string} - UTC time in format: YYYY-MM-DD HH:MM:SS
 * @param end {string} - UTC time in format: YYYY-MM-DD HH:MM:SS
 */
dbfuncs.addReservation = function(userid, resources, slicename, start, end, callback) {
	var reservation = {
		userid: userid,
		resource: resources.join(),
		slicename: slicename,
		start: start,
		end: end
	};
	var q = conn.query('INSERT INTO reservation SET ?', reservation, function(err, results, fields) {
		return callback(err, results);
	});
};

/**
 * deletes the reservation based on userid and rsvnid
 * @param rsvnid {string} - id for the specific reservation
 */
dbfuncs.deleteReservation = function(userid, rsvnid, callback) {
	conn.query('DELETE FROM reservation WHERE Id = ? AND userid = ?', [rsvnid, userid], function(err, results, fields) {
		return callback(err, results);
	});
};

/**
 * Overwrites the resources assigned to the reservation
 * @param userid {string} - is required because validation
 * @param rsvnid {string} - id for the specific reservation
 * @param resources {array} - of strings
 */
dbfuncs.updateReservationResource = function(userid, rsvnid, resources, callback) {
	conn.query('UPDATE reservation SET resources = ? WHERE userid = ? AND Id = ?', [resources.join(), userid, rsvnid], function(err, results, fields) {
		return callback(err, results);
	});
};

/**
 *
 * @param userid {string} - is required because validation
 * @param rsvnid {string} - id for the specific reservation
 * @param start {string} - UTC in format YYYY-MM-DD HH:MM:SS
 * @param end {string} - UTC in format YYYY-MM-DD HH:MM:SS
 */
dbfuncs.updateReservationTime = function(userid, rsvnid, start, end, callback) {
	conn.query('UPDATE reservation SET start = ?, end = ? WHERE userid = ? AND Id = ?', [start, end, userid, rsvnid], function(err, results, fields) {
		return callback(err, results);
	});
};

module.exports = dbfuncs;

/* ====================================================================================== */
/* ============================== DB FUNCTIONS: RESOURCES =============================== */
/* ====================================================================================== */

/**
 * @returns {array} resources object
 */
dbfuncs.listResources = function(callback) {
	conn.query('SELECT * FROM resource', function(err, results, fields) {
		return callback(err, results);
	});
};

dbfuncs.addResource = function(resname, stitchport, callback) {
	var reso = {
		resname: resname,
		stitchport: stitchport
	};
	conn.query('INSERT INTO resource SET ?', reso, function(err, results, fields) {
		return callback(err, results);
	});
};

dbfuncs.deleteResource = function(resoid, callback) {
	conn.query('DELETE FROM resource WHERE Id = ?', resoid, function(err, results, fields) {
		return callback(err, results);
	});
};
