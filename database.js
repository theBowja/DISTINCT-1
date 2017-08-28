var fs = require('fs');
var config = require('./config/config.js');

var db = {};

var dbCredentials = {
    dbName: 'profiles'
};

function getDBCredentialsUrl(jsonData) {
	var vcapServices = JSON.parse(jsonData);
	// Pattern match to find the first instance of a Cloudant service in
	// VCAP_SERVICES. If you know your service key, you can access the
	// service credentials directly by using the vcapServices object.
	for (var vcapService in vcapServices) {
		if (vcapService.match(/cloudant/i)) {
			return vcapServices[vcapService][0].credentials.url;
		}
	}
}

function initDBConnection() {
	//When running on Bluemix, this variable will be set to a json object
	//containing all the service credentials of all the bound services
	if (process.env.VCAP_SERVICES) {
		dbCredentials.url = getDBCredentialsUrl(process.env.VCAP_SERVICES);
	} else { //When running locally, the VCAP_SERVICES will not be set

		// When running this app locally you can get your Cloudant credentials
		// from Bluemix (VCAP_SERVICES in "cf env" output or the Environment
		// Variables section for an app in the Bluemix console dashboard).
		// Once you have the credentials, paste them into a file called vcap-local.json.
		// Alternately you could point to a local database here instead of a
		// Bluemix service.
		// url will be in this format: https://username:password@xxxxxxxxx-bluemix.cloudant.com
		dbCredentials.url = getDBCredentialsUrl(fs.readFileSync("config/vcap-local.json", "utf-8"));
	}

	config.dbURL = dbCredentials.url;

	var cloudant = require('cloudant')(dbCredentials.url);

	// DATABASE FOR 'PROFILES'
	// check if DB exists if not create
	cloudant.db.create(dbCredentials.dbName, function(err, res) {
		if (err) {
			console.log('Could not create new db: ' + dbCredentials.dbName + ', it might already exist.');
		}
		db.profiles = cloudant.use(dbCredentials.dbName);
	});

	// DATABASE FOR 'SCHEDULE'
	// will return error if the database already exists
	cloudant.db.create('schedule', function(err, res) {
		db.schedule = cloudant.use('schedule');

		if (!err) { // if database is newly created
			// insert initial doc
			console.log("DB WRITE - init schedule doc");
			db.schedule.insert({ scheduler: true, events: [] });
		}

		// cleanup expired events every half hour
		setInterval( function() {
			console.log("DB QUERY - events");
			db.schedule.find({selector:{scheduler:true}}, function(err, result) {
				if (err || result.docs.length === 0) return;
				var schedule = result.docs[0];

				var expired = schedule.expired || [];
				var filteredevents = [];
				var events = schedule.events || [];
				events.forEach( function(ele) { // split the events
					if (new Date(ele.end) < new Date())
						expired.push(ele);
					else
						filteredevents.push(ele);
				});

				schedule.expired = expired;
				schedule.events = filteredevents;

				console.log("DB WRITE - filter expired events");
				db.schedule.insert(schedule);
			});
		}, 30 * 60 * 1000);
	});

	config.dbCredentials = dbCredentials;
}

initDBConnection();

module.exports = db;