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
	return res.render('scheduler');
});

router.get('/organizer', function(req, res) {
	dbfuncs.listTopologies(req.session.user.Id, function(err, data) {
		if (err) return console.log(err);
		return res.render('fileorganizer', { topologies: data, haspem: req.session.hasOwnProperty('pem') });
	});
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

router.get('/createslice', function(req, res) {
	return res.render('createslice');
});

/**
 * if user does NOT have permission to access the topology, then it'll redirect to createslice
 */
router.get('/createslice/:topoloc', function(req, res) {
	dbfuncs.getPermissionbyLocation(req.session.user.Id, req.params.topoloc, function(err, permission) {
		if (err) { console.log(err); return res.redirect('createslice'); } // no permission

		fsfuncs.readfile(req.params.topoloc, function(err, body) {
			var pemname = (req.session.pem) ? req.session.pem.originalname : "";
			var pubname = (req.session.pub) ? req.session.pub.originalname : "";
			return res.render('createslice', { topology: body.toString(), topoloc: req.params.topoloc, pemname: pemname, pubname: pubname });
		});
	});
});

router.get('/slicestatus/:slicename', function(req, res) {
	return res.render('slicestatus', { slicename: req.params.slicename });
});

router.get('/uploadkeys/', function(req, res) {
	return res.render('upload', { pem: true, pub: true} );
});

router.get('/uploadkeys/:specific', function(req, res) {
	if(req.params.specific === "pem")
		return res.render('upload', { pem: true } );
	else if(req.params.specific === "pub")
		return res.render('upload', { pub: true } );
	else
		return res.redirect('uploadkeys');
});

router.post('/uploadkeys', upload.fields([{ name: 'pem', maxCount: 1}, { name: 'pub', maxCount: 1 }]), function(req, res) {
	if(req.files['pem']) {
		req.session.pem = req.files['pem'][0];
		req.session.pem.data = req.session.pem.buffer.toString();
		delete req.session.pem.buffer
	}
	if(req.files['pub']) {
		req.session.pub = req.files['pub'][0];
		req.session.pub.data = req.session.pub.buffer.toString();
		delete req.session.pub.buffer;
	}

	return res.render('delayredirect', { message: 'success', url: 'dashboard', delay: 2000 });
});

var api = require('./api/index.js');
router.use('/api', api);


module.exports = router;
