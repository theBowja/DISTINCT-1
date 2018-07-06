var ahab = require('express').Router();

var path = require('path');

var dbfuncs = require('../../database/dbfuncs.js');
var fsfuncs = require('../../database/fsfuncs.js');
var ahabfuncs = require('../../database/ahabfuncs.js');

// this middleware says that all following paths of this router require an ssl/pem
ahab.use( function(req, res, next) {
	if(req.session.pem) {
		next();
	} else {
		next()
		//res.redirect('/uploadpem');
	}
});

ahab.delete('/ahab/:slicename', function(req, res) {

	ahabfuncs.callFunction(req.session.pem, null, 'deleteSlice', req.params.slicename, function(err, data) {
		if(err) return res.sendStatus(500);
		return res.sendStatus(200);

	});
});

/**
 * returns an array of slice names that are "active"
 *
 */
ahab.get('/listactiveslices', function(req, res) {

	ahabfuncs.callFunction(req.session.pem, null, 'listSlices', null, function(err, data) {
		if(err) return res.send(err);
		return res.send(data);

	});


});

/**
 * returns an array of resources of the slice
 */
ahab.get('/resources/:slicename', function(req, res) {
	ahabfuncs.callFunction(req.session.pem, null, 'getAllResources', [req.params.slicename], function(err, data) {
		return res.send(data);
	});
});

/** 
 * returns a javascript object of key-values with resource name as key and state as value
 */
ahab.get('/slicestatus/:slicename', function(req, res) {
	ahabfuncs.callFunction(req.session.pem, null, 'getAllResourceStatuses', [req.params.slicename], function(err, data) {
		return res.send(data);
	});
});

// this middleware says that all following paths of this router require an ssh/pub
ahab.use( function(req, res, next) {
	if( req.session.pub) {
		next();
	} else {
		next()
		//res.redirect('/uploadpub');
	}
});

ahab.post('/reserve/:topoloc', function(req, res) {
	// req.session.pem
	// req.session.pub

	// check if user has the read permission
	dbfuncs.getPermissionbyLocation(req.session.user.Id, req.params.topoloc, function(err, perm) {
		if (err) return res.sendStatus(403); // FORBIDDEN (or not found lol)

		fsfuncs.readfile(req.params.topoloc, function(err, topology) {
			if (err) { console.log(err); return res.sendStatus(500); }



			ahabfuncs.loadProfile(pem, pub);
			ahabfuncs.createSlice(JSON.parse(topology));
			return res.send('success slice lol');
		});
	});

	// fsfuncs.deletefile(pem, function(err) { if (err) console.error(err); });
	// fsfuncs.deletefile(pub, function(err) { if (err) console.error(err); });
});



module.exports = ahab;