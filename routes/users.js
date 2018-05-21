var express = require('express');
var router = express.Router();

// middleware for user login authentication
// checks swt


/* GET users listing. */
router.get('/', function(req, res) {
	res.send('respond with a resource');
});

router.get('/dashboard', function(req, res) {
	res.render('dashboard');
});

router.get('/profile', function(req, res) {

});

router.get('/scheduler', function(req, res) {
	res.render('scheduler', { group: req.user._id} );
});

router.get('/organizer', function(req, res) {

});

router.get('/editor', function(req, res) {
	res.render('editor');
});

router.get('/editor/:fileName', function(req, res) {
	console.log("DB LOOKUP - " + req.params.fileName);
	db.profiles.attachment.get(req.user._id, req.params.fileName, function(err, body) {
		if (err) {
			console.log("file probably not found");
			return res.render('editor');
		}

		return res.render('editor', { fileName: req.params.fileName, data: body.toString()} );
	});
});


module.exports = router;
