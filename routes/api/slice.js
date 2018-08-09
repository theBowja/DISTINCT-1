var slic = require('express').Router();

var dbfuncs = require('../../database/dbfuncs.js');

var fs = require('fs-extra');
var path = require('path');
var config = require('../../config/config.js');
var uuidv4 = require('uuid/v4');
var { fork } = require('child_process');


slic.get('/listslices', function(req, res) {
	dbfuncs.listSlices(req.session.user.Id, function(err, data) {
		if(err) { console.error(err); return res.sendStatus(500); }
		return res.send(data);
	});
});

slic.get('/listactiveslices', function(req, res) {
	dbfuncs.listActiveSlices(req.session.user.Id, function(err, data) {
		if(err) { console.error(err); return res.sendStatus(500); }
		return res.send(data);
	});
});

slic.get('/listdelayedslices', function(req, res) {
	dbfuncs.listDelayedSlices(req.session.user.Id, function(err, data) {
		if(err) { console.error(err); return res.sendStatus(500); }
		return res.send(data);
	});
});

/**
 * returns an object containing resources of the slicename
 */
slic.get('/listresources/:slicename', function(req, res) {
	dbfuncs.getSlice(req.session.user.Id, sliceid, function(err, slice) {
		if(err) { res.sendStatus(500); }

		// use child process
		const ahabfuncs = fork('../../ahab/ahabfuncs.js', [slice.pemloc, slice.slicename]);
		ahabfuncs.on('message', function(result) { return res.send(result); });
		ahabfuncs.on('error', function(err) { return res.sendStatus(500); });
		ahabfuncs.send('listResources');
	});
});

/**
 * @returns true if slice was succesfully deleted, or false because slice was not found
 *	 	otherwise, return error 500
 */
slic.delete('/deleteslice/:sliceid', function(req, res) {
	dbfuncs.getSlice(req.session.user.Id, req.params.sliceid, function(err, slice) {
		if(err) { console.error(err); return res.sendStatus(500); }

		var topopath = path.join(__dirname, "../../"+slice.topoloc);
		var pempath = path.join(__dirname, "../../"+slice.pemloc);
		var pubpath = path.join(__dirname, "../../"+slice.publoc);
		console.log(path.join(__dirname, "../../"+slice.pemloc));
		// use child process
		const ahabfuncs = fork('ahab/ahabfuncs.js', [pempath, slice.slicename]);
		ahabfuncs.on('message', function(result) { 
			Promise.all([fs.remove(topopath), fs.remove(pempath), fs.remove(pubpath)])
			.then(() => {
				dbfuncs.deleteSlice(req.session.user.Id, req.params.sliceid, function(err, data) {
					if(err) throw err;
					return res.send(result);
				});
			})
			.catch((err) => { console.log(err); return res.sendStatus(500); });
		});
		ahabfuncs.on('error', function(err) { return res.sendStatus(500); });
		ahabfuncs.send('deleteSlice');
	});
});

// route for updating list of active slices (incase one of them expires or idk)


slic.post('/createslice/:topoloc', function(req, res) {
	if(!req.session.pem || !req.session.pub)
		return res.sendStatus(403);

	console.log(req.body.isDelayed);

	// check if user can access the topology
	dbfuncs.getPermissionbyLocation(req.session.user.Id, req.params.topoloc, function(err, perm) {
		if (err) return res.sendStatus(403); // FORBIDDEN (or not found)

		// make files for topo, pem, and pub
		var newtopopath = path.join(config.filedirectory, uuidv4());
		var pempath = path.join(config.filedirectory, uuidv4());
		var pubpath = path.join(config.filedirectory, uuidv4());
		req.body.isDelayed = req.body.isDelayed === 'true';
		Promise.all([fs.copy(path.join(config.filedirectory, req.params.topoloc), newtopopath),
					 fs.writeFile(pempath, req.session.pem.data),
					 fs.writeFile(pubpath, req.session.pub.data)])
		.then(() => {
			if(req.body.isDelayed)
				return uuidv4();
			// else start child process and call ahab function to create slice
			const ahabfuncs = fork('ahab/ahabfuncs.js', [pempath, pubpath, newtopopath]);
			ahabfuncs.on('message', function(slicename) { // success function
				return slicename;
			});
			ahabfuncs.on('error', function(err) {
				throw err;
			});
			ahabfuncs.send('createSlice');
		})
		.then((slicename) => {
			console.log("insert into database");
			// insert into database
			var slice = {
				userid: req.session.user.Id,
				slicename: slicename,
				isDelayed: req.body.isDelayed,
				topoloc: newtopopath,
				pemname: req.session.pem.originalname,
				pemloc: pempath,
				pubname: req.session.pub.originalname,
				publoc: pubpath,
				expiration: new Date().toISOString().slice(0, 19).replace('T', ' ')
			};
			dbfuncs.addSlice(slice, function(err, data) {
				if(err) throw err;
				return res.sendStatus(200);
			});			
		})
		.catch(err => {
			console.error(err);
			deleteThoseFiles(500);
		});

		// unlink snapshoted files
		function deleteThoseFiles(statuscode) {
			Promise.all([fs.remove(newtopopath), fs.remove(pempath), fs.remove(pubpath)])
			.then(() => {
				return res.sendStatus(statuscode);
			})
			.catch(() => {
				return res.sendStatus(500);
			});
		}
	});
});





module.exports = slic;