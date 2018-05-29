var conn = require('./db.js');
var bcrypt = require('bcrypt');

var dbfuncs = {};


/* Verifies user login using params: username, plaintextpassword.
	Use bcrypt to compare passwords.
	Returns: a user object containing: id, username
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
				username : results[0].username
			};
			return callback(null, user);
		});
	});

};

/* Creates a user in the database using params: username, email, and password.
     This function hashes the password before inserting into the database.
     Duplicate username is also checked and returns an error if there is.
*/
dbfuncs.createuser = function(username, email, password, callback) {
	bcrypt.hash(password, 10, function(err, hash) {
		var user = {
			username: username,
			email: email,
			password: hash
		};

		conn.query('INSERT INTO user SET ?', user, function(err, results, fields) {
			if (err) return callback(err);
			return callback(null, results);
		});
	});
	
};

dbfuncs.getPermission = function(userid, topoid, callback) {
	var query = {
		userid: userid,
		topoid: topoid
	};
	conn.query('SELECT role FROM permission WHERE SET ?', query, function(err, results, fields) {
		if (err) return callback(err);
		if (results.length == 0) return callback("PERMISSION_NOT_FOUND");

		return callback(null, results[0].role);
	});
};

/* Gets the permission associated with the user and file location
     callback: err may be FILE_NOT_FOUND or PERMISSION_NOT_FOUND
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

/* Gets the id associated with the file location.
*/
dbfuncs.getIdbyLocation = function(location, callback) {
	conn.query('SELECT Id FROM topology WHERE location = ?', location, function(err, results, fields) {
		if (err) return callback(err);
		if (results.length == 0) return callback("FILE_NOT_FOUND");

		return callback(null, results[0].Id);
	});
};

dbfuncs.getTopology = function(topoid, callback) {
	conn.query('SELECT * FROM topology WHERE Id = ?', topoid, function(err, results, fields) {
		if (err) return callback(err);

		return callback(null, results[0]);
	});
};

dbfuncs.getTopologybyLocation = function(location, callback) {
	conn.query('SELECT * FROM topology WHERE location = ?', location, function(err, results, fields) {
		if (err) return callback(err);

		return callback(null, results[0]);
	});
};

/* Gets a list of all topologies the user has access to using: userid.
	 Returns an array of objects. The objects are of format: { toponame: toponame, location: locaiton }
*/
dbfuncs.listTopologies = function(userid, callback) {
	conn.query('SELECT topology.toponame, topology.location FROM permission, topology, WHERE permission.userid = ? AND permission.topoid = topology.Id;', userid, function (err, results, fields) {
		if (err) return callback(err);

		return callback(null, results);
	});
};







module.exports = dbfuncs;