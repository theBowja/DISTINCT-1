var ahab = require('express').Router();


var ahabfuncs = require('../../database/ahabfuncs.js');


ahab.put('/ahab/:topoloc', function(req, res) {
	// check if user has the read permission
	dbfuncs.getPermissionbyLocation(req.session.user.Id, req.params.topoloc, function(err, perm) {
		if (err) return res.sendStatus(403); // FORBIDDEN (or not found lol)

		fsfuncs.readfile(req.params.topoloc, function(err, topology) {
			if (err) { console.log(err); return res.sendStatus(500); }

			var pem = "C:\\Users\\Eric Xin\\.ssh\\geni-ericxin.pem";
			var pub = "C:\\Users\\Eric Xin\\.ssh\\id_geni_ssh_rsa.pub";

			ahabfuncs.loadProfile(pem, pub, function(err, yes) {
				if (err) { console.log(err); return res.sendStatus(500); }
				
				ahabfuncs.createSlice(JSON.parse(topology));
			});
		});
	});
});

ahab.get('/listactiveslices', function(req, res) {
	
});


module.exports = ahab;