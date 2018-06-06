var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);

var config = require('./config/config.js');


app = express();

// view egine setup; template engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');




// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



var options = {
	host 		: config.db.hostname,
	user		: config.db.username,
	password	: config.db.password,
	port        : config.db.port,
	database	: config.db.dbname//'session_test'
};

var sessionStore = new MySQLStore(options);
app.use(session({
	key: 'session_cookie_name',
	secret: 'session_cookie_',
	store: sessionStore,
	resave: false,
	rolling: true, // resets expiration countdown of cookie
	saveUninitialized: false,
	cookie: {
		maxAge: 60*60*1000 // 1 hour
	}
}));


var java = require('java');
var fs = require('fs');
// java.classpath.push('C:/Users/Eric Xin/Desktop/ahab-master/ahab-master/libndl/src')
java.classpath.pushDir(path.resolve(__dirname, "ahab"));
//java.classpath.push(path.resolve(__dirname, "ahab/*.jar"));

// java.classpath.push(path.resolve(__dirname, "ahab/libndl.jar"));
// java.classpath.push(path.resolve(__dirname, "ahab/libtransport.jar"));
// java.classpath.push(path.resolve(__dirname, "ahab/jung-graph.jar"));
// java.classpath.push(path.resolve(__dirname, "ahab/jung-api-2.0.1.jar"));
// java.classpath.push(path.resolve(__dirname, "ahab/test.jar"));
// java.classpath.push(path.resolve(__dirname, "ahab/slick.jar"));

// console.log('jar exists: ' + fs.existsSync(path.join(__dirname, "ahab/libndl.jar")));
//console.log(path.resolve(__dirname, "hello.jar"));
//java.classpath.push(path.resolve(__dirname,'hello.jar'));
//console.log(java.findClassSync+"");
//var Main = java.import('HelloWorld.Main');
console.log("loading slice class");

var slice = java.newInstanceSync("org.renci.ahab.libndl.Slice");

java.callMethodSync(instance, "setName", "OBAMA");
console.log(java.callMethodSync(instance, "getName"));
//var Slice = java.import('org.renci.ahab.libndl.Slice');
//var slice = new Slice();
//slice.setName("OBAMA");
//console.log(slice.getName());


	
var index = require('./routes/index');
//var users = require('./routes/users');
app.use('/', index);
//app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
// app.listen(config.port, function() {
// 	console.log('Express server listening on port ' + config.port);
// });