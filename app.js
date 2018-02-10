var express = require('express'), app = express(), http = require('http');


// Configure jade as template engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Serve static content from "public" directory
app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static(path.join(__dirname + 'views'))); // to serve any file in this folder


// middleware
var bodyParser = require('body-parser'); // needed to touch body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // populates object with key-value pairs. value can be string or array when extended: false, or any type when extended: true.


app.listen(config.port, function() {
	console.log('Express server listening on port ' + config.port);
});