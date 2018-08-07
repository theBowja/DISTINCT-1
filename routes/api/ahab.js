var ahab = require('express').Router();

var fs = require('fs-extra');
var path = require('path');
var config = require('../../config/config.js');
var uuidv4 = require('uuid/v4');
var { fork } = require('child_process');

var dbfuncs = require('../../database/dbfuncs.js');
var ahabfuncs = require('../../ahab/ahabfuncs.js');

// this middleware says that all following paths of this router require an ssl/pem
ahab.use( function(req, res, next) {
	if(req.session.pem) {
		next();
	} else {
		res.sendStatus(403);
	}
});

ahab.delete('/ahab/:slicename', function(req, res) {
	ahabfuncs.callFunction(req.session.pem.data, null, 'deleteSlice', req.params.slicename, function(err, data) {
		if(err) return res.sendStatus(500);
		return res.sendStatus(200);

	});
});

/**
 * returns an array of slices associated with the pem
 *
 */
ahab.get('/listprofileslices', function(req, res) {
	ahabfuncs.callFunction(req.session.pem.data, null, 'listSlices', null, function(err, data) {
		if(err) return res.send(err);
		return res.send(data);

	});
});

/**
 * returns an object of resources of the slice
 */
ahab.get('/listresources/:slicename', function(req, res) {
	ahabfuncs.callFunction(req.session.pem.data, null, 'listResources', [req.params.slicename], function(err, data) {
		return res.send(data);
	});
});

/** 
 * returns a javascript object of key-values with resource name as key and state as value
 */
ahab.get('/resourcestatuses/:slicename', function(req, res) {
	ahabfuncs.callFunction(req.session.pem.data, null, 'listResourceStatuses', [req.params.slicename], function(err, data) {
		return res.send(data);
	});
});

// this middleware says that all following paths of this router require an ssh/pub
ahab.use( function(req, res, next) {
	if( req.session.pub) {
		next();
	} else {
		res.sendStatus(403);
	}
});

ahab.get('/create/:topoloc', function(req, res) {

	// check if user has the read permission of topology
	dbfuncs.getPermissionbyLocation(req.session.user.Id, req.params.topoloc, function(err, perm) {
		if (err) return res.sendStatus(403); // FORBIDDEN (or not found lol)

		fs.readFile(path.join(config.filedirectory, req.params.topoloc), function(err, topology) {
			if (err) { console.log(err); return res.sendStatus(500); }

			// makes files for topo, pem, and pub
			var newtopopath = path.join(config.filedirectory, uuidv4());
			var pempath = path.join(config.filedirectory, uuidv4());
			var pubpath = path.join(config.filedirectory, uuidv4());
			fs.copy(topopath, newtopopath)
			.then(() => { return fs.writeFile(pempath, req.session.pem.data); })
			.then(() => { return fs.writeFile(pubpath, req.session.pub.data); })
			.then(() => {
				const test = fork('../../ahab/ahabfuncs.js');

			})
			.then(() => {
				ahabfuncs.callFunction(pempath, pubpath, 'createSlice', [JSON.parse(topology)], function(err, data) {
					if(err) return res.sendStatus(500);
					return res.send('success slice lol');
				});
			})
			.catch(err => {
				console.error(err);
				return res.send(err);
			});
		});
	});

});



module.exports = ahab;