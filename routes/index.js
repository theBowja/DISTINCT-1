/*
This route handles whenever the user is not logged in
*/
var routes = require('express').Router();
var user = require('./user/index.js');

var passport = require('passport');

routes.use('/u', user);

routes.get('/', function(req, res) {
	res.redirect('/login');
	//res.render('main');
});

routes.get('/login', function(req, res) {
	res.render('login');
});

routes.post('/login', passport.authenticate('local-login', { successRedirect:'/u/dashboard', failureRedirect: '/login'}) );


module.exports = routes;