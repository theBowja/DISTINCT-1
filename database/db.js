var mysql = require('mysql');
var config = require('../config/config.js');
var schema = require('./schema.js');


var conn = mysql.createConnection({
	host 		: config.db.hostname,
	user		: config.db.username,//config.db.username,
	password	: config.db.password,//config.db.password,
	port        : config.db.port,
	database    : config.db.database
});

conn.query('CREATE DATABASE IF NOT EXISTS ' + config.db.dbname, function(err) {
	if (err) throw err;
	conn.query('USE ' + config.db.dbname, function(err) {
		if (err) throw err;
		// create all tables that don't exist
		for (var key in schema.defs) {
			if (!schema.defs.hasOwnProperty(key)) continue;
			conn.query('CREATE TABLE IF NOT EXISTS '+ schema.defs[key], function (err) {
	                if (err) throw err;
	        });	
		}

	});
});

module.exports = conn;

