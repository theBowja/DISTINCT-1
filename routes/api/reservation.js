var rsvn = require('express').Router();

var path = require('path');

var dbfuncs = require('../../database/dbfuncs.js');
var fsfuncs = require('../../database/fsfuncs.js');

/**
 * @returns {array} - of objects: { Id: {string}, resource: {array}, slicename: {string}, start: {string}, end: {string} }
 */
rsvn.get('/listreservations', function(req, res) {
	dbfuncs.listAllReservations(function(err, data) {
		if (err) return console.log(err);
		return res.send(data);
	});
});

/**
 * @returns {array} - of objects: { Id: {string}, resource: {array}, slicename: {string}, start: {string}, end: {string} }
 */
rsvn.get('/listmyreservations', function(req, res) {
	dbfuncs.listUserReservations(req.session.user.Id, function(err, data) {
		if (err) return console.log(err);
		return res.send(data);
	});
});

rsvn.post('/rsvn/:slicename', function(req, res) {

});

rsvn.delete('/rsvn/:rsvnid', function(req, res) {

});



module.exports = rsvn;