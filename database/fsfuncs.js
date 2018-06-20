var fs = require('fs');
var path = require('path');
var config = require('../config/config.js');


var fsfuncs = {};


fsfuncs.readfile = function(fileloc, callback) {
	fs.readFile(path.join(config.filedirectory,fileloc), callback);
};

fsfuncs.writefile = function(fileloc, data, callback) {
	fs.writeFile(path.join(config.filedirectory,fileloc), data, callback);
};

fsfuncs.deletefile = function(fileloc, callback) {
	fs.unlink(path.join(config.filedirectory,fileloc), callback);
};



module.exports = fsfuncs;