var express = require('express');
var router = express.Router();

var dbfuncs = require('../database/dbfuncs.js');
var fsfuncs = require('../database/fsfuncs.js');

var multer = require('multer');
var upload = multer({
	limits: {
		fileSize: 50 * 1000 // 50KB
	}
});

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
		if (err) return console.log(err);
		topologies = data;
		complete();
	});

	// dbfuncs.listActiveSlices(req.session.user.Id, function(err, data) {
	// 	if (err) return console.log(err);
	// 	activeslices = data;
	// 	complete();
	// });

	// function complete() {
	// 	if (topologies !== null && activeslices !== null)
	// 		return res.render('fileorganizer', { topologies: topologies, activeslice: activeslices });
	// }

	function complete() {
		return res.render('fileorganizer', { topologies: topologies, hasSSL: (req.session.ssl!==null) });
	}
});

// query parameters: topoid, toponame
router.get('/editor', function(req, res) {
	return res.render('editor');
});

router.get('/editor/:topoloc', function(req, res) {
	dbfuncs.getPermissionbyLocation(req.session.user.Id, req.params.topoloc, function(err, permission) {
		if (err) { console.log(err); return res.redirect('editor'); } // no permission

		fsfuncs.readfile(req.params.topoloc, function(err, body) {
			return res.render('editor', { fileName: JSON.parse(body).toponame, data: body.toString(), topoloc: req.params.topoloc });
		});
	});
});

router.get('/reserve', function(req, res) {
	return res.render('reserve');
});

router.get('/reserve/:topoloc', function(req, res) {
	dbfuncs.getPermissionbyLocation(req.session.user.Id, req.params.topoloc, function(err, permission) {
		if (err) { console.log(err); return res.redirect('editor'); } // no permission

		fsfuncs.readfile(req.params.topoloc, function(err, body) {
			return res.render('reserve', { topology: body.toString(), topoloc: req.params.topoloc });
		});
	});
});

router.get('/slicestatus/:slicename', function(req, res) {
	return res.render('slicestatus', { slicename: req.params.slicename });
});

router.get('/upload/ssl', function(req, res) {
	return res.render('upload');
});

router.post('/upload/ssl', upload.single('ssl'), function(req, res) {
	req.session.pem = req.file.buffer.toString();
	return res.send("success");
});

var api = require('./api/index.js');
router.use('/api', api);


module.exports = router;
