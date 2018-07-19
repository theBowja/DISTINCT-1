var rsvn = require('express').Router();

var path = require('path');

var dbfuncs = require('../../database/dbfuncs.js');
var fsfuncs = require('../../database/fsfuncs.js');

var schema = require('../../database/schema.js');

/**
 * @returns {array} - of objects: { Id: {string}, resource: {array}, slicename: {string}, start: {string}, end: {string} }
 */
rsvn.get('/listreservations', function(req, res) {
	dbfuncs.listAllReservations(function(err, data) {
		if (err) { console.log(err); return res.sendStatus(500); }
		var reservations = [];
		for(let r of data) {
			reservations.push({
			id: r.Id,
			title: 'required lol',
	});			
		}
		return res.send(reservations);
	});
});

/**
 * @returns {array} - of objects: { Id: {string}, resource: {array}, slicename: {string}, start: {string}, end: {string} }
 */
rsvn.get('/listmyreservations', function(req, res) {
	dbfuncs.listUserReservations(req.session.user.Id, function(err, data) {
		if (err) { console.log(err); return res.sendStatus(500); }
		return res.send(data);
	});
});

rsvn.get('/rsvnresources', function(req, res) {
	var rsvnresources = [];
	for(let rr of schema.rsvnresources) {
		rsvnresources.push({
			id: rr,
			title: rr
		})
	}
	return res.send(rsvnresources)
});

rsvn.post('/rsvn/:slicename', function(req, res) {
	var tmp = req.body['resources[]'];
	var resources = Array.isArray(tmp) ? tmp : [tmp];
	dbfuncs.addReservation(req.session.user.Id, resources, req.params.slicename, req.body.start, req.body.end, function(err, data) {
		if (err) { console.log(err); return res.sendStatus(500); }
		return res.sendStatus(200);
	});
});

rsvn.delete('/rsvn/:rsvnid', function(req, res) {
	dbfuncs.deleteReservation(req.session.user.Id, req.params.rsvnid, function(err, data) {
		if (err) { console.log(err); return res.sendStatus(500); }
		return res.sendStatus(200);		
	});
});





module.exports = rsvn;