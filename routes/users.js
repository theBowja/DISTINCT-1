var express = require('express');
var router = express.Router();

// middleware for user login authentication
// checks swt


/* GET users listing. */
router.get('/', function(req, res, next) {
	res.send('respond with a resource');
});

router.get('/dashboard', function(req, res, next) {
	res.render('dashboard');
});

router.get('/profile', function(req, res, next) {

});

router.get('/scheduler', function(req, res, next) {

});

router.get('/organizer', function(req, res, next) {

});

router.get('/editor', function(req, res, next) {

});

router.get('/logout', function(req, res, next) {

});



module.exports = router;
