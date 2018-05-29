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
	var data;
	// test if it is a json file, otherwise don't accept
	try {
		data = JSON.parse(req.body.jsontopo);
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

api.get('/listtopologies', function(req, res) {
	dbfuncs.listTopologies(req.session.user.Id, function(err, data) {
		if (err) { console.log('some error has occured in list'); return res.sendStatus(500); }

		return res.send(data);
	});
});