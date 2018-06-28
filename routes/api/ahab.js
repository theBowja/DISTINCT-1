var ahab = require('express').Router();

var path = require('path');
var multer = require('multer');
var upload = multer({ dest: 'public/temp/', limits: {fileSize: 100000 } });
var autoReap = require('multer-autoreap');

var dbfuncs = require('../../database/dbfuncs.js');
var fsfuncs = require('../../database/fsfuncs.js');
var ahabfuncs = require('../../database/ahabfuncs.js');


ahab.post('/reserve/:topoloc', upload.fields([{ name: 'sslcert', maxCount: 1 }, { name: 'sshpub', maxCount: 1 }]), autoReap, function(req, res) {
	res.on('autoreap', function(reapedFile) {
	    console.log(reapedFile);
	});

	var pem = path.join(__dirname, "../../"+req.files.sslcert[0].path);
	var pub = path.join(__dirname, "../../"+req.files.sshpub[0].path);

	// check if user has the read permission
	dbfuncs.getPermissionbyLocation(req.session.user.Id, req.params.topoloc, function(err, perm) {
		if (err) return res.sendStatus(403); // FORBIDDEN (or not found lol)

		fsfuncs.readfile(req.params.topoloc, function(err, topology) {
			if (err) { console.log(err); return res.sendStatus(500); }



			ahabfuncs.loadProfile(pem, pub);
			ahabfuncs.createSlice(JSON.parse(topology));
			return res.send('success slice lol');
		});
	});

	// fsfuncs.deletefile(pem, function(err) { if (err) console.error(err); });
	// fsfuncs.deletefile(pub, function(err) { if (err) console.error(err); });
});

ahab.delete('/ahab/:slicename', upload.single('sslcert'), autoReap, function(req, res) {
	res.on('autoreap', function(reapedFile) {
	    console.log(reapedFile);
	});

	var pem = path.join(__dirname, "../../"+req.file.path);
	ahabfuncs.loadProfile(pem);
	if(ahabfuncs.deleteSlice(req.params.slicename))
		return res.sendStatus(200);
	else
		return res.sendStatus(500);
});

ahab.post('/listactiveslices', upload.single('sslcert'), autoReap, function(req, res) {
	res.on('autoreap', function(reapedFile) {
	    console.log(reapedFile);
	});

	var pem = path.join(__dirname, "../../"+req.file.path);
	ahabfuncs.loadProfile(pem);
	return res.send(ahabfuncs.listSlices());


});


module.exports = ahab;