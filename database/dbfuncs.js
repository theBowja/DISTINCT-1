var conn = require('./db.js');
var bcrypt = require('bcrypt');

var dbfuncs = {};


/* Verifies user login using params: username, plaintextpassword.
	Use bcrypt to compare passwords.
	Returns: a user object containing: id, username
*/
dbfuncs.login = function(username, password, callback) {
	conn.query('SELECT * FROM user WHERE username = ?;', username, function (err, result, fields) {
		if (err) return callback(err);
		if (result.length == 0) return callback("USER_NOT_FOUND");

		bcrypt.compare(password, result[0].password, function(err, res) {
			if (err) return callback("BCRYPT_ERR");
			if (!res) return callback("INCORRECT_PWD");
			// else user login success
			//   update lastlogin
			var user = {
				id : result[0].id,
				username : result[0].username
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

		conn.query('INSERT INTO user SET ?', user, function (err, result, field) {
			if (err) return callback(err);
			return callback(null, result);
		});
	});
	
};

dbfuncs.gettopology = function(topoid, callback) {


};

/* Gets a list of all topologies the user has access to using: userid.
*/
dbfuncs.gettopologylist = function(userid, callback) {
	conn.query('SELECT * FROM permission WHERE userid = ?;', userid, function (err, result, fields) {
		if (err) return callback(err);

	});
};







module.exports = dbfuncs;