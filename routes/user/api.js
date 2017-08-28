// not entirely sure what api means but it seems like these things go here
var api = require('express').Router();

var db = require('../../database');
var uuidv1 = require('uuid/v1');

var Ajv = require('ajv');
var topologySchema = require('../../public/scripts/topologySchema.js');

api.get('/file/:fileName', function(req, res) {
	console.log("DB LOOKUP - " + req.params.fileName);
	db.profiles.attachment.get(req.user._id, req.params.fileName, function(err, body) {
		if (err) {
			console.log("file probably not found");
			return res.send("Error: file probably not found");
		}

		res.send(""+body);
		//return res.render('viewfile', { contents: body} );
	});
});

// api that allows a user to access another user's file if and only if they are given permissions to by the other user
api.get('/sfile/:user/:fileName', function(req, res) {
	console.log("DB LOOKUP - other's profile");
	db.profiles.get(req.params.user, function(err, body) {
		// !((body.shared || {}).permissions || {})[req.params.fileName] is the test for !body.shared.permissions[req.params.fileName]
		if (err || !((body.shared || {}).permissions || {})[req.params.fileName]) return res.sendStatus(400); // user or permission doesn't exist
		if (body.shared.permissions[req.params.fileName].indexOf(req.user._id) !== -1) { // if permission is allowed
			console.log("DB LOOKUP - " + req.params.fileName);
			db.profiles.attachment.get(req.user._id, req.params.fileName, function(err, body) {
				if (err) {
					console.log("file probably not found");
					return res.send("Error: file probably not found");
				}
				return res.send(""+body);
			});	
		} else { // if permission is not allowed, then erase the "access" on "this" profile
			console.log("DB LOOKUP - this profile");
			db.profiles.get(req.user._id, function(err, body) {
				if (!body.shared) {
					body.shared = {
						"access": {},
						"permissions": {}
					};
				} else if (!body.shared.access) {
					body.shared.access = {};
				} else if (body.shared.access[req.params.user]) { // access exists, then check 
					body.shared.access[req.params.user] = body.shared.access[req.params.user].filter( function(ele) { return ele===req.params.fileName; } );
				}
				db.profiles.insert(body, function(err, body) {
					return res.sendStatus(403); // permission denied
				});
			});
		}
	});
});

// TODO: fix unnecessary lookup. The script in the pug file refreshes the page so you have
//       LOOKUP - deserializing - deserializing - attachments
//       can probably remove one 'deserializing' if I send updated attachments from here
api.delete('/file/:fileName', function(req, res) {
	console.log("DB WRITE - destroy attachment");
	db.profiles.attachment.destroy(req.user._id, req.params.fileName, {rev: req.user._rev}, function(err, body) {
		if (err) {
			console.log("Error: in destroying attachment");
			return res.sendStatus(500);
		}
		return res.sendStatus(200); // equivalent to res.status(200).send('OK')
	});
});

api.post('/upload/:fileName', function(req, res) {
	var data;
	// test if it is a json file, otherwise don't accept
	try {
		data = JSON.parse(req.body.jsonfile);
	} catch (e) {
		return res.sendStatus(400); // not in json format
	}

	// validate the data according to a schema
	var ajv = Ajv({ $data: true, allErrors: true});
	// var ajv = Ajv({ $data: true, allErrors: true, removeAdditional: true});
	ajv.addKeyword('containsNodeName', { $data:true, "validate": function (schema, data, parentSchema, currentDataPath, parentDataObject, parentProperty, rootData) {
		for (let node of rootData.nodes) { // not supported in all browsers
			if( node.name === data)
				return true;
		}
		return false;
	}, "errors": false });
	var valid = ajv.validate(topologySchema, data);
	if (!valid) return res.sendStatus(400); // does not pass validation format // console.log(ajv.errors)


	console.log("DB WRITE - write file");
	db.profiles.attachment.insert(req.user._id, req.params.fileName, req.body.jsonfile, "application/octet-stream", {rev: req.user._rev}, function(err, body) {
		if (err) {
			console.log("database attachment insert error");
			return res.send("an error has occured");
		}
		return res.sendStatus(200);
	});

});

api.get('/listattachments', function(req, res) {
	console.log("DB LOOKUP - attachments");
	db.profiles.get(req.user._id, function(err, body) {
	 	if (err) {
	 		console.log("erroring in database lookup");
	 		return res.sendStatus(500);
	 	}

		return res.send(body._attachments);
	});
});

// Returns the array of active events. If there are no active events, then return an empty array.
api.get('/events', function(req, res) {
	console.log("DB QUERY - events");
	db.schedule.find({selector:{scheduler:true}}, function(err, result) {
		if (err) return res.sendStatus(400);
		return res.send(result.docs.length === 0 ? [] : result.docs[0].events || []);
	});
});

api.post('/events', function(req, res) {
	var event = req.body.newevent;
	var evStart = new Date(event.start).getTime();
	var evEnd = new Date(event.end).getTime();
	// check if 'event' is a valid event
	if (typeof event !== 'object' ||
		!event.hasOwnProperty('title') ||
		!event.hasOwnProperty('start') ||
		!event.hasOwnProperty('end') ||
		evStart === 'NaN' || evEnd === 'NaN' ||
		evStart >= evEnd ||
		evEnd - evStart > 5 * 24 * 60 * 60 * 1000) {
		return res.sendStatus(400);
	}

	console.log('DB QUERY - events');
	db.schedule.find({selector:{scheduler:true}}, function(err, result) {
		var schedule = result.docs.length === 0 ? { scheduler: true, events: [] } : result.docs[0];
		if (!Array.isArray(schedule.events)) schedule.events = [];

		// check if 'event' overlaps with an existing event
		if (!schedule.events.every(function(ele) { return evEnd <= new Date(ele.start).getTime() || evStart >= new Date(ele.end).getTime(); }))
			return res.sendStatus(409); // Conflict

		// 'sanitize' by mapping
		var newEvent = {
			id: uuidv1(),
			title: event.title,
			group: req.user._id,
			allDay: false,
			start: event.start,
			end: event.end
		};

		schedule.events.push(newEvent);

		console.log('DB WRITE - add event');
		db.schedule.insert(schedule, function(err, body) {
			return res.sendStatus(200); // OK
		});
	});
});

api.delete('/events/:eventID', function(req, res) {
	console.log('DB QUERY - events');
	db.schedule.find({selector:{scheduler:true}}, function(err, result) {
		if (err || result.docs.length === 0 || !result.docs[0].events) return res.sendStatus(400);

		var schedule = result.docs[0];
		var ind = schedule.events.findIndex(function(ele) { return ele.id === req.params.eventID && ele.group === req.user._id; });
		if (ind === -1) return res.sendStatus(400);
		schedule.events.splice(ind,1);

		console.log('DB WRITE - delete event');
		db.schedule.insert(schedule, function(err, body) {
			return res.sendStatus(200); // OK
		});
	});
});


module.exports = api;