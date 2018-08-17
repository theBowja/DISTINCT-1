var fs = require('fs');
var path = require('path');
var config = require('../config/config.js');

/**
 * What is the point of this module? Well it's for in case you 
 * want to implement a different way to store topologies
 */

var fsfuncs = {};


fsfuncs.readfile = function(fileloc, callback) {
	fs.readFile(path.join(config.filedirectory,fileloc), function(err, data) {
		callback(err, ""+data);
	});
};

fsfuncs.writefile = function(fileloc, data, callback) {
	fs.writeFile(path.join(config.filedirectory,fileloc), data, callback);
};

fsfuncs.deletefile = function(fileloc, callback) {
	fs.unlink(path.join(config.filedirectory,fileloc), callback);
};



//module.exports = fsfuncs;