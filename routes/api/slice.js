var slic = require('express').Router();

var dbfuncs = require('../../database/dbfuncs.js');




slic.get('/listslice', function(req, res) {
	dbfuncs.listSlices(req.session.user.Id, function(err, data) {
		if(err) { console.error(err); return res.sendStatus(500); }
		return res.send(data);
	});
});

slic.get('/listactiveslice', function(req, res) {
	dbfuncs.listActiveSlices(req.session.user.Id, function(err, data) {
		if(err) { console.error(err); return res.sendStatus(500); }
		return res.send(data);
	});
});

slic.get('/listdelayedslice', function(req, res) {
	dbfuncs.listDelayedSlices(req.session.user.Id, function(err, data) {
		if(err) { console.error(err); return res.sendStatus(500); }
		return res.send(data);
	});
});


// route for updating list of active slices (incase one of them expires or idk)








module.exports = slic;