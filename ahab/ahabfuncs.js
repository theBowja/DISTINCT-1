var fs = require('fs');
var path = require('path');

var java = require('java');
java.classpath.pushDir(path.resolve(__dirname, "libs"));

/**
 * This function is called by a child thread.
 * second, it writes any file that is needed
 * third, it calls the 'exposed' ahab function
 *  @param {string} method - 
 *  @argv - an array of arguments provided by the child process
 */
process.on('message', (method) => {
	var args = process.argv.slice(2);

	var result = ahabfuncs[method].apply(ahabfuncs, args);

	process.send(result);
});

var ahabfuncs = {};

/**
 * @return slicename
 */
ahabfuncs.createSlice = function(pem, pub, topopath) {
	var topology = JSON.parse(fs.readFileSync(topopath));
	//console.log(topology);
	var sctx = java.newInstanceSync('org.renci.ahab.libtransport.SliceAccessContext');
	var fac = java.newInstanceSync('org.renci.ahab.libtransport.util.SSHAccessTokenFileFactory', pub, false);
	var t = java.callMethodSync(fac, "getPopulatedToken");
	java.callMethodSync(sctx, "addToken", "distinct", "distinct", t);
	java.callMethodSync(sctx, "addToken", "distinct", t);

	var sliceProxy = this.getSliceProxy(pem);
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

	// return the slicename
	return topology.toponame;
};

ahabfuncs.deleteSlice = function(pem, slicename) {
	var sliceProxy = this.getSliceProxy(pem);

	var sliceList = this.listSlices(pem);
	if(!sliceList.includes(slicename)) return false;

	var s = java.callStaticMethodSync("org.renci.ahab.libndl.Slice", "loadManifestFile", sliceProxy, slicename);
	java.callMethodSync(s, "delete");
	return true;
};

/* returns a javascript array
*/
ahabfuncs.listSlices = function(pem) {
	var sliceProxy = this.getSliceProxy(pem);

	return java.callMethodSync(sliceProxy, "listMySlices");
};

/* returns a javascript object of resource names
*/
ahabfuncs.listResources = function(pem, slicename) {
	var sliceProxy = this.getSliceProxy(pem);
	var s = java.callStaticMethodSync("org.renci.ahab.libndl.Slice", "loadManifestFile", sliceProxy, slicename);

	java.callMethodSync(s, 'getAllResources').toStringSync()
	var funcs = ["getAllResources", "getInterfaces", "getLinks", "getBroadcastLinks", "getNodes", "getComputeNodes", "getStorageNodes", "getStitchPorts"];
	var names = ["allResources", "interfaces", "links", "broadcastLinks", "nodes", "computeNodes", "storageNodes", "stitchPorts"];

	var resources = {};
	for(let i = 0; i < funcs.length; i++) {
		resources[names[i]] = java.callMethodSync(s, funcs).toStringSync().slice(1, -1).replace(/ /g,'').split(',');
	}
	return resources;
};

/** 
 * returns a javascript object of key-values with resource name as key and state as value
 */
ahabfuncs.listResourceStatuses = function(pem, slicename) {
	var sliceProxy = this.getSliceProxy(pem);
	var s = java.callStaticMethodSync("org.renci.ahab.libndl.Slice", "loadManifestFile", sliceProxy, slicename);

	var resStats = Object.create(null);
	var resources = java.callMethodSync(s, 'getAllResources').toStringSync().slice(1, -1).replace(/ /g,'').split(',');
	for(let rname of resources) {
		var cn = java.callMethodSync(s, 'getResourceByName', rname);
		var state = java.callMethodSync(cn, 'getState');
		resStats[rname] = state;
	}
	return resStats;
};

// TBD
ahabfuncs.renewSlice = function(pem, slicename, date) {
	var sliceProxy = this.getSliceProxy(pem);
	var s = java.callStaticMethodSync("org.renci.ahab.libndl.Slice", "loadManifestFile", sliceProxy, slicename);

	java.callMethodSync(s, 'renew', date);
};

ahabfuncs.getSliceProxy = function(pem) {
	var ifac = java.newInstanceSync('org.renci.ahab.libtransport.xmlrpc.XMLRPCProxyFactory');
	var ctx = java.newInstanceSync('org.renci.ahab.libtransport.PEMTransportContext', "", pem, pem);
	return java.callMethodSync(ifac, "getSliceProxy", ctx, java.newInstanceSync('java.net.URL', "https://geni.renci.org:11443/orca/xmlrpc"));
};

module.exports = ahabfuncs;