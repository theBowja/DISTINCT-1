var user = require('express').Router();

// middleware for handling multipart/form-data (which is used for uploading files)
var multer = require('multer');
// middleware for reaping uploaded files saved to disk by multer. removes upon response end or close
var autoReap = require('multer-autoreap');
var maxUploadSize = 25 * 1000; // 25KB
var upload = multer({
	dest: 'public/uploads/',
	limits: {
		fileSize: maxUploadSize
	}
});

var fs = require('fs');
var db = require('../../database');

// Authentication Middleware
// Requires that user must be logged in (authenticated)
//   in order to access the rest of the paths below
user.use(function(req,res,next) {
	if (req.isAuthenticated()) {
		next();
	} else {
		res.redirect('/login');
	}
});

user.get('/', function(req,res) {
	console.log("GET request for /u/ homepage");
	res.redirect('/u/dashboard');
});

// Passes the role as an option to the pug template.
//   The pug file will determine what will be displayed based on the role.
// Admins will have more options available to them on the dashboard.
user.get('/dashboard', function(req, res) {
	res.render('dashboard', { username: req.user.username, role: req.user.role} );
});

// user.get('/search', function(req, res) {
// 	console.log("DB QUERY - search");
// 	db.profiles.find({selector:{username:req.query.username}}, function(err, result) {
// 		if (result.docs.length === 0) {
// 			return res.sendStatus(200);
// 		} else {
// 			res.writeHead(400, "Username already exists");
// 			return res.send();
// 			//return res.sendStatus(400);
// 		}
// 	});
// });

user.get('/profile', function(req, res) {
	res.send('PROFILE PAGE HERE LMAOOOOOOO');
});

user.get('/test', function(req, res) {
	res.render('delayredirect', { message: "omg omg", delay: 3000, url: '/u/dashboard'});
});

user.get('/scheduler', function(req, res) {
	console.log("DB QUERY - scheduler");

	res.render('scheduler', { group: req.user._id} );
});

user.get('/organizer', function(req, res) {
	console.log("DB LOOKUP - attachments");
	db.profiles.get(req.user._id, function(err, body) {
	 	if (err) { console.log("erroring in database lookup"); }

		res.render('fileorganizer', { attachments: body._attachments} );
	});

});

// multer puts the file into req.files
user.post('/organizer', upload.single('fileToUpload'), autoReap, function(req, res) {
	//res.on('autoreap', function(reapedFile) { console.log("reaped file"); });

	// TODO: makes sure file name is unique

	// multer saves the file temporarily to disk first.
	// we must read this file in order to upload it as an attachment to the user's document
	fs.readFile(req.file.path, function(err, data) {
		if (err) {
			console.log("error reading file for upload");
			return res.send("error: read file");
		}

		console.log("DB WRITE - insert attachment");
		db.profiles.attachment.insert(req.user._id, req.file.originalname, data, req.file.mimetype, {rev: req.user._rev}, function(err, body) {
			if (err) {
				console.log("database attachment insert error");
				return res.send("an error has occured");
			}
			var message = req.file.originalname + " saved successfully";
			return res.render('delayredirect', { message: message, delay: 4000, url: '/u/organizer'});
		});
	});
});

user.get('/editor', function(req, res) {
	res.render('editor');
});

user.get('/editor/:fileName', function(req, res) {
	console.log("DB LOOKUP - " + req.params.fileName);
	db.profiles.attachment.get(req.user._id, req.params.fileName, function(err, body) {
		if (err) {
			console.log("file probably not found");
			return res.render('editor');
		}

		return res.render('editor', { fileName: req.params.fileName, data: body.toString()} );
	});
});

user.get('/logout', function(req, res) {
	console.log("GET request for /logout");

	req.logout();
	res.redirect('/login');

	// req.session.destroy(function(err) {
	// 	if(err) console.log("LOGOUT error");
	// 	res.redirect('/login');
	// });
});

var api = require('./api');
user.use('/api', api);

// middleware definition applies only to the routes that comes after it.
// putting this at the bottom prevents the middleware in userAdmin
//   from being called for the above paths
var userAdmin = require('./admin');
user.use('/', userAdmin);

module.exports = user;