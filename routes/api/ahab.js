var ahab = require('express').Router();

var fs = require('fs-extra');
var path = require('path');
var config = require('../../config/config.js');
var uuidv4 = require('uuid/v4');
var { fork } = require('child_process');

var dbfuncs = require('../../database/dbfuncs.js');
var ahabfuncs = require('../../ahab/ahabfuncs.js');

// THESE SET OF ROUTES DIFFER FROM THE ROUTES IN SLICE.JS

// middleware: all following paths of this router require an ssl/pem
ahab.use( function(req, res, next) {
	if(req.session.pem) {
		var pempath = path.join(config.filedirectory, uuidv4());
		fs.writeFile(pempath, req.session.pem.data, function(err) {
			if(err) return res.sendStatus(500);
			req.session.pem.temploc = pempath;
			next();
		});
	} else {
		return res.sendStatus(403);
	}
});

/**
 * 
 */
ahab.delete('/:slicename', function(req, res) {

	// use child process
	const ahabfuncs = fork('../../ahab/ahabfuncs.js', [req.session.pem.data, req.params.slicename]);
	ahabfuncs.on('message', function(result) { res.send(result); next(); });
	ahabfuncs.on('error', function(err) {  res.sendStatus(500); next(); });
	ahabfuncs.send('deleteSlice');

	// ahabfuncs.callFunction(req.session.pem.data, null, 'deleteSlice', req.params.slicename, function(err, data) {
	// 	if(err) return res.sendStatus(500);
	// 	return res.sendStatus(200);
	// });
});

/**
 * returns an array of slices associated with the pem ONLY. (the pem that is stored in session)
 * DOES NOT LIST THE SLICES STORED IN THE DATABASE
 */
ahab.get('/listslices', function(req, res) {

	// use child process
	const ahabfuncs = fork('../../ahab/ahabfuncs.js', [req.session.pem.data]);
	ahabfuncs.on('message', function(result) { res.send(result); next(); });
	ahabfuncs.on('error', function(err) { res.sendStatus(500); next(); });
	ahabfuncs.send('listSlices');

	// ahabfuncs.callFunction(req.session.pem.data, null, 'listSlices', null, function(err, data) {
	// 	if(err) return res.send(err);
	// 	return res.send(data);

	// });
});

/**
 * returns an object containing resources of the slicename
 */
ahab.get('/listresources/:slicename', function(req, res) {
	dbfuncs.getSlice(req.session.user.Id, sliceid, function(err, slice) {
		if(err) { res.sendStatus(500); next()}

		// use child process
		const ahabfuncs = fork('../../ahab/ahabfuncs.js', [slice.pemloc, slice.slicename]);
		ahabfuncs.on('message', function(result) { return res.send(result); });
		ahabfuncs.on('error', function(err) { return res.sendStatus(500); });
		ahabfuncs.send('listResources');
	});
});

/** 
 * returns a javascript object of key-values with resource name as key and state as value
 */
ahab.get('/resourcestatuses/:sliceid', function(req, res) {
	dbfuncs.getSlice(req.session.user.Id, sliceid, function(err, slice) {
		if(err) return res.sendStatus(500);

		// use child process
		const ahabfuncs = fork('../../ahab/ahabfuncs.js', [slice.pemloc, slice.slicename]);
		ahabfuncs.on('message', function(result) { return res.send(result); });
		ahabfuncs.on('error', function(err) { return res.sendStatus(500); });
		ahabfuncs.send('listResourceStatuses');
	});
});

// delete temp pem file
ahab.use (function(req, res, next) {
	if(req.session.pem.temploc) {
		fs.remove(req.session.pem.temploc, function(err) {
			if(err) return res.sendStatus(500);
			delete req.session.pem.temploc;
		});
	}
	next();
});

// ####################################################################################################
// ####################################################################################################
// ####################################################################################################
// ####################################################################################################
// ####################################################################################################
// ####################################################################################################
// ####################################################################################################
// ####################################################################################################
// ###########################################  BS  ###################################################
// ####################################################################################################
// ####################################################################################################
// ####################################################################################################
// ####################################################################################################
// ####################################################################################################
// ####################################################################################################
// ####################################################################################################

// this middleware says that all following paths of this router require an ssh/pub
ahab.use( function(req, res, next) {
	if( req.session.pub) {
		next();
	} else {
		res.sendStatus(403);
	}
});

/**
 * returns the sliceid for the successfully created slice
 */
ahab.get('/create/:topoloc', function(req, res) {

	// check if user has the read permission of topology
	dbfuncs.getPermissionbyLocation(req.session.user.Id, req.params.topoloc, function(err, perm) {
		if (err) return res.sendStatus(403); // FORBIDDEN (or not found lol)

		// makes files for topo, pem, and pub
		var newtopopath = path.join(config.filedirectory, uuidv4());
		var pempath = path.join(config.filedirectory, uuidv4());
		var pubpath = path.join(config.filedirectory, uuidv4());
		Promise.all([fs.copy(req.params.topoloc, newtopopath),
					 fs.writeFile(pempath, req.session.pem.data),
					 fs.writeFile(pubpath, req.session.pub.data)])
		.then(() => {
			// make child process and call ahab function
			const ahabfuncs = fork('../../ahab/ahabfuncs.js', [pempath, pubpath, newtopopath]);
			ahabfuncs.on('message', function(slicename) { // success function
				// insert into database
				var slice = {
					userid: req.session.user.Id,
					slicename: slicename,
					isDelayed: false,
					topoloc: newtopopath,
					pemname: req.session.pem.originalname,
					pemloc: pempath,
					pubname: req.session.pub.originalname,
					publoc: pubpath,
					expiration: new Date().toISOString().slice(0, 19).replace('T', ' ')
				};
				dbfuncs.addSlice(slice, function(err, data) {
					if(err) { console.error(err); res.sendStatus(500); }
					return res.sendStatus(200);
				});
			});
			ahabfuncs.on('error', function(err) {
				// unlink snapshoted files
				Promise.all([fs.remove(newtopopath), fs.remove(pempath), fs.remove(pubpath)])
				.finally(() => {
					return res.sendStatus(500);
				});
			});
			ahabfuncs.send('createSlice');
		})
		.catch(err => {
			console.error(err);
			return res.send(err);
		});
	});

});



module.exports = ahab;