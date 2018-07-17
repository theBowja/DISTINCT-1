var topo = require('express').Router();

var Ajv = require('ajv');
var topologySchema = require('../../public/javascripts/topologySchema.js');

var dbfuncs = require('../../database/dbfuncs.js');
var fsfuncs = require('../../database/fsfuncs.js');


topo.get('/topo/:topoloc', function(req, res) {
	dbfuncs.getPermissionbyLocation(req.session.user.Id, req.params.topoloc, function(err, perm) {
		if (err) { console.log(err); return res.send("permission err"); }

		fsfuncs.readfile(req.params.topoloc, function(err, body) {
			if (err) {
				console.log("file probably not found");
				return res.send("Error: file probably not found");
			}
			
			return res.send(body);
			//return res.render('viewfile', { contents: body} );
		});
	});
});

/**
 * Creates a new topology file. 
 * @returns topoloc on success
 */
topo.post('/topo/:topoloc', function(req, res) {
	var data = req.body.jsontopo;
	// test if it is a json file, otherwise don't accept
	try {
		var toponame = JSON.parse(data).toponame;
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
	var valid = ajv.validate(topologySchema, JSON.parse(data));
	if (!valid) { console.log(ajv.errors); return res.sendStatus(400); } // does not pass validation format

	// check if user has the write permission
	dbfuncs.getPermissionbyLocation(req.session.user.Id, req.params.topoloc, function(err, perm) {
		if (err && err === "PERMISSION_NOT_FOUND" || perm && perm.role === "readonly")
			{ console.log(err); return res.sendStatus(403); } // FORBIDDEN
		if (err && err !== "FILE_NOT_FOUND") { console.log(err); return res.sendStatus(500); }

		// writing the file
		if (err === "FILE_NOT_FOUND") {
			// creates new file
			dbfuncs.createTopology(req.session.user.Id, toponame, function(err, topo) {
				if (err) { console.log(err); return res.sendStatus(500); }
				fsfuncs.writefile(topo.location, data, function(err) {
					if (err) { console.log(err); return res.sendStatus(500); }
					return res.send(topo.location);
				});
			});
		} else { 
			// updates file
			dbfuncs.updateTopology(perm.topoid, toponame, function(err, topo) {
				if (err) { console.log(err); return res.sendStatus(500); }
				fsfuncs.writefile(req.params.topoloc, data, function(err) {
					if (err) { console.log(err); return res.sendStatus(500); }

					return res.send(req.params.topoloc);
				});
			});
		}
	});
});

topo.delete('/topo/:topoloc', function(req, res) {
	dbfuncs.deleteTopology(req.params.topoloc, function(err, data) {
		if (err) { console.log(err); return res.sendStatus(500); }

		fsfuncs.deletefile(req.params.topoloc, function(err) {
			if (err) { console.log(err); return res.sendStatus(500); }

			return res.sendStatus(200);			
		});
	});
});

topo.get('/listtopologies', function(req, res) {
	dbfuncs.listTopologies(req.session.user.Id, function(err, data) {
		if (err) { console.log(err); return res.sendStatus(500); }

		return res.send(data);
	});
});

module.exports = topo;