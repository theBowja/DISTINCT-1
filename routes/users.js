var express = require('express');
var router = express.Router();

// middleware for user login authentication
// checks swt


/* GET users listing. */
router.get('/', function(req, res) {
	return res.send('respond with a resource');
});

var config = require('../config/config.js');
var fs = require('fs');
router.get('/filewritetest', function(req, res) {
	fs.writeFile(config.filedirectory+'/helloworld.txt', 'Hello World! - ' + req.session.user.username, function(err) {
    	if (err) return console.log(err);
    	console.log('Wrote Hello World in file helloworld.txt, just check it');
	});
});

router.get('/filereadtest', function(req, res) {
	fs.readFile(config.filedirectory+'/helloworld.txt', function(err, data) {
		if(err) return res.send(err);
		res.send(data);
	});
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

});

router.get('/editor', function(req, res) {
	return res.render('editor');
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
