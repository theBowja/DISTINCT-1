var express = require('express'), app = express(), http = require('http');
var path = require('path'), fs = require('fs');

var config = require('./config/config.js'); // I think this is how a config file should work
var db = require('./database');


// Configure jade as template engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Serve static content from "public" directory
app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static(path.join(__dirname + 'views'))); // to serve any file in this folder


// middleware
var bodyParser = require('body-parser'); // needed to touch body
var session = require('express-session');
var CloudantStore = require('connect-cloudant-store')(session);
var store = new CloudantStore({
	url: config.dbURL,
	databaseName: 'sessions'
	// ttl: 5 * 60 * 1000 // 5 minutes
});
var passport = require('passport');
require('./config/auth.js'); // initialize

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // populates object with key-value pairs. value can be string or array when extended: false, or any type when extended: true.
app.use(session({
	store: store,
	secret: 'bunny buddy',
	resave: true,
	saveUninitialized: false,
	//store: , // default is MemoryStore instance which is not for production
	//rolling: true, // set cookie on every response. expiration set to original maxAge
	cookie: {
		maxAge: 5 * 60 * 1000 // 5 minute
	}
}));
app.use(passport.initialize());
app.use(passport.session());

store.on('connect', function() {
	console.log("cloudant session store is ready for use");
	// set cleanup job every other hour
	// setInterval(function() {
	// 	console.log("cleanup");
	// 	store.cleanupExpired();
	// }, 60 * 60 * 1000);
});

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});

// TODO: supply a favicon.ico file that is available at the root
// app.get('/favicon.ico', function(req, res) {
// 	console.log("favi");
// 	res.sendStatus(204);
// });

var routes = require('./routes');
app.use('/', routes);

app.get('/session', function(req,res) {
	res.send(req.session);
});

app.get('/test', function(req,res) {
	//console.log(store.cleanupExpired)
	store.cleanupExpired();
	res.send("reload");
 	//db.view("expired_sessions", "express_expired_sessions", {limit: 100}, function(err, body) {res.send(err)})

	//res.send(""+store.cleanupExpired);
	// db.list({include_docs: true},function(err, body) {
	// 	var myarr = body.rows.map(function(ele) {
	// 		return {
	// 			username: ele.doc.username,
	// 			email: ele.doc.email,
	// 			role: ele.doc.role,
	// 			timeCreated: ele.doc.timeCreated
	// 		};
	// 	});
	// 	res.render('userlist', {data:myarr});
	// });

});

app.get('/dbinit', function (req, res) {
	console.log("GET request for /dbinit");
	// TBD

	db.profiles.list(function(err,body){
		if(!err) {
			body.rows.forEach(function(doc) {
      			console.log(doc);
    		});
		}
	});

});



// this is somehow producing an "Error: Can't set headers after they are sent."
app.use('*', function(req,res){
	console.log("404 /* =>", req.originalUrl);
	res.status(404).send('404 page not found');
});

// error-handling middleware
app.use(function(err, req, res, next) {
	if (err) {
		switch (err.code) {
			case 'LIMIT_FILE_SIZE':
				res.send('File size too large');
			break;
			default:
				res.sendStatus(500);
				//next(err);
		}
	} else {
		next();
	}
});

app.listen(config.port, function() {
	console.log('Express server listening on port ' + config.port);
});