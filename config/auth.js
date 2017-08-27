var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');

var config = require('./config.js');
var db = require('../database');

var cloudant = require('cloudant');

// used to serialize the user for the session
passport.serializeUser(function(user, done) {
	console.log("serializing");
    done(null, user._id);
});

// used to deserialize the user
// uses the user._id used above to perform a database lookup.
// This is as opposed to using the user.username to perform a database query.
//   I have higher throughput on lookups anyways.
// The user object is stored in req.user
passport.deserializeUser(function(docID, done) {
	console.log("DB LOOKUP - deserializing");
	db.profiles.get(docID, function(err, body) {
	 	if (err) { console.log("erroring in database lookup"); }

		var user = {
			_id: body._id,
			_rev: body._rev,
			username: body.username,
			role: body.role
		};
		return done(null, user);
	});
});

// First queries to see if username exists,
// then uses bcrypt to compare hashed passwords,
// finally updates lastLogin before returning success.
passport.use('local-login', new LocalStrategy( function(username, password, done) {
	// Cloudant query
	console.log("DB QUERY - login");
	db.profiles.find({selector:{lowercaseusername:username.toLowerCase()}}, function(err, result) {
		if (err) {
			console.log(""+ err);
			return done(null, false, { message: "There was an error connecting to the database" } );
		} else if (result.docs.length === 0) {
			console.log("Username not found");
			return done(null, false, { message: "Username not found" } );
		}
		// assume now that <username> is found and usernames are unique
		var user = result.docs[0];

		bcrypt.compare(password, user.password, function(err, res) {
			if (err) {
				console.log("Error in bcrypt compare:" + err);
				return done(null, false, { message: "Server-side error"} );
			}

			if (res === true) {
				console.log("Password matches");
				console.log("DB WRITE - last login");
				user.lastLogin = new Date().toISOString();
				db.profiles.insert(user, function(err, body) {
					if (err) {
						console.log("error in lastlogin write");
						return done(null, false, {message: "Database error"} );
					}
					return done(null, user);
				});
			} else {
				console.log("Incorrect password");
				return done(null, false, { message: "Password is incorrect"} );
			}
		});
	});
}));

passport.use('local-signup', new LocalStrategy({passReqToCallback:true}, function(req, username, password, done) {
	var body = req.body;

	console.log("DB QUERY - signup");
	db.profiles.find({selector:{lowercaseusername:username.toLowerCase()}}, function(err, result) {
		if (err) {
			console.log("Error find:" + err);
			return done(null, false, { message: "There was an error connecting to the databse"} );
		} else if (result.docs.length > 0) {
			console.log("Username found");
			return done(null, false, { message: "Username already exists"} );
		}

		// create a new user
		bcrypt.hash(password, 10, function(err, hash) {
			var user = { // TODO: make a schema/validator for user
				username: username,
				lowercaseusername: username.toLowerCase(),
				password: hash,
				role: (body.role || "user").toLowerCase(), // admin or user
				email: body.email || "no@email",
				timeCreated: new Date().toISOString(),
				lastLogin: ''
			};

			console.log("DB WRITE - signup");
			db.profiles.insert(user, function(err, body) {
				if (err) {
					console.log("Cannot insert document into database");
					return done(null, false, { message: "Problem with registering user into Cloudant"} );
				} else {
					console.log("Success registering " + username);
					return done(null, user);
				}
			});
		});
	});
}));