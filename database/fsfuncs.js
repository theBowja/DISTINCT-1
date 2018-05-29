var fs = require('fs');
var path = require('path');
var config = require('../config/config.js');


var fsfuncs = {};


fsfuncs.readfile = function(fileloc, callback) {
	fs.readFile(path.join(config.filedirectory,fileloc), function(err, data) {
		if (err) return callback(err);
		return callback(null, data);
	});
};

fsfuncs.writefile = function(fileLoc, callback) {
	fs.writeFile(path.join(config.filedirectory,fileloc), function(err) {
		if (err) return callback(err);
		return callback(null, "SUCCESS");
	});
};



module.exports = fsfuncs;