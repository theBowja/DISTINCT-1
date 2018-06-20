var express = require('express');
var router = express.Router();

var dbfuncs = require('../database/dbfuncs.js');
var fsfuncs = require('../database/fsfuncs.js');

// middleware for user login authentication
// checks swt


/* GET users listing. */
router.get('/', function(req, res) {
	return res.send('respond with a resource please');
});

router.get('/dashboard', function(req, res) {
	return res.render('dashboard');
});

router.get('/profile', function(req, res) {

});

router.get('/scheduler', function(req, res) {
	return res.render('scheduler', { group: req.user._id} );
});

router.get('/organizer', function(req, res) {
	var topologies = null;
	var activeslices = null;

	dbfuncs.listTopologies(req.session.user.Id, function(err, data) {
		if (err) console.log(err);
		topologies = data;
		complete();
	});

	dbfuncs.listActiveSlices(req.session.user.Id, function(err, data) {
		if (err) console.log(err);
		activeslices = data;
		complete();
	});

	function complete() {
		if (topologies !== null && activeslices !== null)
			return res.render('fileorganizer', { topologies: topologies, activeslice: activeslices });
	}
});

// query parameters: topoid, toponame
router.get('/editor', function(req, res) {
	return res.render('editor');
});

router.get('/editor/:topoloc', function(req, res) {
	dbfuncs.getPermissionbyLocation(req.session.user.Id, req.params.topoloc, function(err, permission) {
		if (err) { console.log(err); return res.redirect('editor'); }

		fsfuncs.readfile(req.params.topoloc, function(err, body) {
			return res.render('editor', { fileName: JSON.parse(body).toponame, data: body.toString() });
		});
	});
});

var api = require('./api.js');
router.use('/api', api);


module.exports = router;
