var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.redirect('/login');
    //res.render('index', { title: 'Express' });
});

router.get('/login', function(req, res, next) {
	res.render('login');
});

//router.post('/login', functio)

module.exports = router;
