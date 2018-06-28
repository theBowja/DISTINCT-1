var java = require('java');
var fs = require('fs');
var path = require('path');

java.classpath.pushDir(path.resolve(__dirname, "../ahab"));

var ahabfuncs = {};

var pem;
var pub;

/* pem is the file address to the ssl certificate issued by GENI
   pub is the file address to the ssh public key you want to use
*/
ahabfuncs.loadProfile = function(private, public) {
	pem = private;
	pub = public;
};


ahabfuncs.createSlice = function(topology) {
	console.log(topology);
	console.log("creating slice");
	var sctx = java.newInstanceSync('org.renci.ahab.libtransport.SliceAccessContext');
	var fac = java.newInstanceSync('org.renci.ahab.libtransport.util.SSHAccessTokenFileFactory', pub, false);
	var t = java.callMethodSync(fac, "getPopulatedToken");
	java.callMethodSync(sctx, "addToken", "xin", "xin", t);
	java.callMethodSync(sctx, "addToken", "xin", t);
	// console.log(sctx+"");

	var sliceProxy = getSliceProxy();
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

var getSliceProxy = (function() {
	var sliceProxy;
	return function() {
		if(sliceProxy === undefined) {
			var ifac = java.newInstanceSync('org.renci.ahab.libtransport.xmlrpc.XMLRPCProxyFactory');
			//console.log("Opening certificate " + pem + " and key " + pem);
			var ctx = java.newInstanceSync('org.renci.ahab.libtransport.PEMTransportContext', "", pem, pem);

			sliceProxy = java.callMethodSync(ifac, "getSliceProxy", ctx, java.newInstanceSync('java.net.URL', "https://geni.renci.org:11443/orca/xmlrpc"));
		}
		return sliceProxy;
	};
})();

ahabfuncs.deleteSlice = function(slicename) {
	var sliceProxy = getSliceProxy();
	var sliceList = ahabfuncs.listSlices();
	if(!sliceList.includes(slicename)) return false;

	var s = java.callStaticMethodSync("org.renci.ahab.libndl.Slice", "loadManifestFile", sliceProxy, slicename);
	java.callMethodSync(s, "delete");
	return true;
};

ahabfuncs.listSlices = function() {
	var sliceProxy = getSliceProxy();
	return java.callMethodSync(sliceProxy, "listMySlices");
};


module.exports = ahabfuncs;