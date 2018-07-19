var express = require('express');
var router = express.Router();
var dbfuncs = require('../database/dbfuncs.js');

/* GET home page. */
router.get('/', function(req, res) {
	res.redirect('/login');
    //res.render('index', { title: 'Express' });
});

router.get('/login', function(req, res) {
	if (req.session.user) // probably already logged in
		return res.redirect('dashboard');
	return res.render('login');
});

router.post('/login', function(req, res) {
	dbfuncs.login(req.body.username, req.body.password, function(err, data) {
		if (err) {
			console.log(err);
			return res.send(err);
		}
		req.session.user = data; // assigns everything from data to the session.user
		return res.redirect('dashboard');
	});

});

router.get('/register', function(req, res) {
	return res.render('register');
});

router.post('/register', function(req, res) {
	dbfuncs.createuser(req.body.username, req.body.email, req.body.password, function(err, data) {
		if (err) {
			if (err.code == 'ER_DUP_ENTRY') {
				return res.render('register', { taken: req.body.username, email: req.body.email, role: req.body.role} );
			} else {
				console.log(err);
				return res.render('delayredirect', { message: 'some error happened', delay: 4000, url: '/u/register'});
			}
		}

		// successful account creation
		var message = "successful account creation of " + req.body.role + " " + req.body.username;
		return res.render('delayredirect', { message: message, delay: 5000, url: '/u/dashboard'});
	});
});

router.get('/logout', function(req, res) {
	req.session.destroy( function(err) {
		if(err) console.log('there was an error destroying the session');
		return res.redirect('/login');
	});
});

// this middleware checks if the user is logged in
//   if the user is logged in, the continues down the route
router.use( function(req, res, next) {
	// if authenticated, then next
	if( req.session.user && req.session.user.hasOwnProperty('Id') && req.session.user.hasOwnProperty('username')) {
		next();
	} else {
		res.redirect('/login');
	}
});

var user = require('./user.js');
router.use('/', user);

module.exports = router;
