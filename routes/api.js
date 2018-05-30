var api = require('express').Router();

var dbfuncs = require('../database/dbfuncs.js');
var fsfuncs = require('../database/fsfuncs.js');


api.get('/topo/:topoloc', function(req, res) {
	fsfuncs.readfile(req.params.topoloc, function(err, body) {
		if (err) {
			console.log("file probably not found");
			return res.send("Error: file probably not found");
		}

		return res.send(""+body);
		//return res.render('viewfile', { contents: body} );
	});
});

api.post('/topo/:topoloc', function(req, res) {
	console.log(req.body.jsontopo);
	var data;
	// test if it is a json file, otherwise don't accept
	try {
		data = JSON.parse(req.body.jsontopo);
	} catch (e) {
		return res.sendStatus(400); // not in json format
	}

	// // validate the data according to a schema
	// var ajv = Ajv({ $data: true, allErrors: true});
	// // var ajv = Ajv({ $data: true, allErrors: true, removeAdditional: true});
	// ajv.addKeyword('containsNodeName', { $data:true, "validate": function (schema, data, parentSchema, currentDataPath, parentDataObject, parentProperty, rootData) {
	// 	for (let node of rootData.nodes) { // not supported in all browsers
	// 		if( node.name === data)
	// 			return true;
	// 	}
	// 	return false;
	// }, "errors": false });
	// var valid = ajv.validate(topologySchema, data);
	// if (!valid) return res.sendStatus(400); // does not pass validation format // console.log(ajv.errors)

	// check if user has the write permission
	dbfuncs.getPermissionbyLocation(req.session.user.Id, req.params.topoloc, function(err, perm) {
		if (err && err === "PERMISSION_NOT_FOUND" || perm && perm.role === "readonly") return res.sendStatus(403); // FORBIDDEN
		if (err && err !== "FILE_NOT_FOUND") { console.log(err); return res.sendStatus(500); }

		// writing the file
		if (err === "FILE_NOT_FOUND") {
			// creates new file
			dbfuncs.createTopology(req.session.user.Id, data.toponame, function(err, topo) {
				if (err) { console.log(err); return res.sendStatus(500); }
				console.log(topo);
				fsfuncs.writefile(topo.location, function(err, data) {
					if (err) { console.log(err); return res.sendStatus(500); }
					return res.sendStatus(200);
				});
			});
		} else { 
			// updates file
			dbfuncs.updateTopology(perm.topoid, data.toponame, function(err, topo) {
				if (err) { console.log(err); return res.sendStatus(500); }
				console.log(topo);
				fsfuncs.writefile(topo.location, function(err, data) {
					if (err) { console.log(err); return res.sendStatus(500); }

					return res.sendStatus(200);
				});
			});
		}
	});
});

api.get('/listtopologies', function(req, res) {
	dbfuncs.listTopologies(req.session.user.Id, function(err, data) {
		if (err) { console.log(err); return res.sendStatus(500); }

		return res.send(data);
	});
});

module.exports = api;