var reso = require('express').Router();


var dbfuncs = require('../../database/dbfuncs.js');




reso.get('/listresources', function(req, res) {
	dbfuncs.listResources(function(err, data) {
		if (err) { console.log(err); return res.sendStatus(500); }
		return res.send(data);
	});
});

/**
 * formating for fullcalendar
 */
reso.get('/listresources-fs', function(req, res) {
	dbfuncs.listResources(function(err, data) {
		if (err) { console.log(err); return res.sendStatus(500); }
		var resources = [];
		for(let res of data) {
			resources.push({ id: res.Id, title: res.resname });
		}
		return res.send(resources);
	});
});

reso.post('/addresource', function(req, res) {
	if(req.session.user.role !== "admin") return res.sendStatus(403);
	dbfuncs.addResource(req.body.resname, req.body.stitchport, function(err, data) {
		if (err) { console.log(err); return res.sendStatus(500); }
		return res.sendStatus(200);
	});
});

reso.delete('/deleteresource/:resoid', function(req, res) {
	console.log("hey");
	if(req.session.user.role !== "admin") return res.sendStatus(403);
	dbfuncs.deleteResource(req.params.resoid, function(err, data) {
		if (err) { console.log(err); return res.sendStatus(500); }
		return res.sendStatus(200);
	});
});



module.exports = reso;