var fs = require('fs');
var path = require('path');
var config = require('../config/config.js');
var uuidv4 = require('uuid/v4');

var java = require('java');
java.classpath.pushDir(path.resolve(__dirname, "../ahab"));

/* the all-purpose function
   first, it creates a child thread to run everything on
   second, it writes any file that is needed
   third, it calls the 'exposed' ahab function
   finally, it deletes the file and terminates the child thread while returning the result
	@param {string} private - 
	@param {string} [public] - 
	@param {string} method - 
	@param {array} [args] - an array of arguments that will be provided to the method
	@callback
*/
module.exports.callFunction = function(private, public, method, args, callback) {
	if(!private) return callback("ssl cert is needed");

	// create a new child thread

	var pem = path.join(__dirname,"../tmp/"+uuidv4());
	var pub = path.join(__dirname,"../tmp/"+uuidv4());
	fs.writeFileSync(pem, private);
	if(public !== null)
		fs.writeFileSync(pub, public);

	try {
		var profile = new ahabFuncs(pem, pub);
		var result = profile[method].apply(profile, args)
	}
	catch(err) {
		console.log(err);
	}

	fs.unlinkSync(pem)
	if(public !== null)
		fs.unlinkSync(pub)

	callback(null, result);

	// end child thread
	//   return callback
	//   child thread can also catch any throws (hopefully)
}

/**
 * constructor
 * @param {string} pem - path to pem file
 * @param {string} pub - path to pub file
 */
function ahabFuncs(pem, pub) {
	this.pem = pem;
	this.pub = pub;
}

ahabFuncs.prototype.createSlice = function(topology) {
	console.log(topology);
	console.log("creating slice");
	var sctx = java.newInstanceSync('org.renci.ahab.libtransport.SliceAccessContext');
	var fac = java.newInstanceSync('org.renci.ahab.libtransport.util.SSHAccessTokenFileFactory', this.pub, false);
	var t = java.callMethodSync(fac, "getPopulatedToken");
	java.callMethodSync(sctx, "addToken", "xin", "xin", t);
	java.callMethodSync(sctx, "addToken", "xin", t);

	var ifac = java.newInstanceSync('org.renci.ahab.libtransport.xmlrpc.XMLRPCProxyFactory');
	var ctx = java.newInstanceSync('org.renci.ahab.libtransport.PEMTransportContext', "", this.pem, this.pem);
	var sliceProxy = java.callMethodSync(ifac, "getSliceProxy", ctx, java.newInstanceSync('java.net.URL', "https://geni.renci.org:11443/orca/xmlrpc"));

	var s = java.callStaticMethodSync("org.renci.ahab.libndl.Slice", 'create', sliceProxy, sctx, topology.toponame);

	for(let node of topology.nodes) {
		newnode = java.callMethodSync(s, "addComputeNode", node.name);
		java.callMethodSync(newnode, "setImage", "http://geni-images.renci.org/images/standard/centos/centos6.7-v1.1.0/centos6.7-v1.1.0.xml","0c22c525b8a4f0f480f17587557b57a7a111d198","centos6.7-v1.1.0");
		java.callMethodSync(newnode, "setNodeType", "XO Small");
	//	java.callMethodSync(newnode, "setDomain", "RENCI (Chapel Hill, NC USA) XO Rack");
	//	java.callMethodSync(newnode, "setPostBootScript", "master post boot script");
	}

	for(let link of topology.links) {
		var net = java.callMethodSync(s, "addBroadcastLink", "Link1");

		var node1 = java.callMethodSync(s, "getResourceByName", link.source);
		var node2 = java.callMethodSync(s, "getResourceByName", link.target);
		java.callMethodSync(net, "stitch", node1);
		java.callMethodSync(net, "stitch", node2);		
	}

	// console.log("testNewSlice1: " + java.callMethodSync(s, "getDebugString"));
	// console.log("testNewSlice1: " + java.callMethodSync(s, "getRequest"));

	java.callMethodSync(s, "commit");
};

ahabFuncs.prototype.deleteSlice = function(slicename) {
	var ifac = java.newInstanceSync('org.renci.ahab.libtransport.xmlrpc.XMLRPCProxyFactory');
	var ctx = java.newInstanceSync('org.renci.ahab.libtransport.PEMTransportContext', "", this.pem, this.pem);
	var sliceProxy = java.callMethodSync(ifac, "getSliceProxy", ctx, java.newInstanceSync('java.net.URL', "https://geni.renci.org:11443/orca/xmlrpc"));

	var sliceList = ahabfuncs.listSlices();
	if(!sliceList.includes(slicename)) return false;

	var s = java.callStaticMethodSync("org.renci.ahab.libndl.Slice", "loadManifestFile", sliceProxy, slicename);
	java.callMethodSync(s, "delete");
	return true;
};

/* returns a javascript array
*/
ahabFuncs.prototype.listSlices = function() {
	var ifac = java.newInstanceSync('org.renci.ahab.libtransport.xmlrpc.XMLRPCProxyFactory');
	var ctx = java.newInstanceSync('org.renci.ahab.libtransport.PEMTransportContext', "", this.pem, this.pem);
	var sliceProxy = java.callMethodSync(ifac, "getSliceProxy", ctx, java.newInstanceSync('java.net.URL', "https://geni.renci.org:11443/orca/xmlrpc"));

	return java.callMethodSync(sliceProxy, "listMySlices");
};

/* returns a javascript object of resource names
*/
ahabFuncs.prototype.listResources = function(slicename) {
	var ifac = java.newInstanceSync('org.renci.ahab.libtransport.xmlrpc.XMLRPCProxyFactory');
	var ctx = java.newInstanceSync('org.renci.ahab.libtransport.PEMTransportContext', "", this.pem, this.pem);
	var sliceProxy = java.callMethodSync(ifac, "getSliceProxy", ctx, java.newInstanceSync('java.net.URL', "https://geni.renci.org:11443/orca/xmlrpc"));

	var s = java.callStaticMethodSync("org.renci.ahab.libndl.Slice", "loadManifestFile", sliceProxy, slicename);

	java.callMethodSync(s, 'getAllResources').toStringSync()
	var funcs = ["getAllResources", "getInterfaces", "getLinks", "getBroadcastLinks", "getNodes", "getComputeNodes", "getStorageNodes", "getStitchPorts"];
	var names = ["allResources", "interfaces", "links", "broadcastLinks", "nodes", "computeNodes", "storageNodes", "stitchPorts"];

	var resources = {};
	for(let i = 0; i < funcs.length; i++) {
		resources[names[i]] = java.callMethodSync(s, funcs).toStringSync().slice(1, -1).replace(/ /g,'').split(',');
	}
	return resources;
}

/** 
 * returns a javascript object of key-values with resource name as key and state as value
 */
ahabFuncs.prototype.listResourceStatuses = function(slicename) {
	var ifac = java.newInstanceSync('org.renci.ahab.libtransport.xmlrpc.XMLRPCProxyFactory');
	var ctx = java.newInstanceSync('org.renci.ahab.libtransport.PEMTransportContext', "", this.pem, this.pem);
	var sliceProxy = java.callMethodSync(ifac, "getSliceProxy", ctx, java.newInstanceSync('java.net.URL', "https://geni.renci.org:11443/orca/xmlrpc"));

	var s = java.callStaticMethodSync("org.renci.ahab.libndl.Slice", "loadManifestFile", sliceProxy, slicename);

	var resStats = Object.create(null);
	var resources = java.callMethodSync(s, 'getAllResources').toStringSync().slice(1, -1).replace(/ /g,'').split(',');
	for(let rname of resources) {
		var cn = java.callMethodSync(s, 'getResourceByName', rname);
		var state = java.callMethodSync(cn, 'getState');
		resStats[rname] = state;
	}
	return resStats
}

ahabFuncs.prototype.getSliceProxy = function(pem) {
	var ifac = java.newInstanceSync('org.renci.ahab.libtransport.xmlrpc.XMLRPCProxyFactory');
	var ctx = java.newInstanceSync('org.renci.ahab.libtransport.PEMTransportContext', "", pem, pem);
	return java.callMethodSync(ifac, "getSliceProxy", ctx, java.newInstanceSync('java.net.URL', "https://geni.renci.org:11443/orca/xmlrpc"));
};
