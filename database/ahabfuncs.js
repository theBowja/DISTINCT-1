var java = require('java');
var fs = require('fs');
var path = require('path');

java.classpath.pushDir(path.resolve(__dirname, "../ahab"));

var ahabfuncs = {};

/* pem is the file address to the ssl certificate issued by GENI
   pub is the file address to the ssh public key you want to use
*/
ahabfuncs.loadProfile = function(pem, pub) {
	var ifac = java.newInstanceSync('org.renci.ahab.libtransport.xmlrpc.XMLRPCProxyFactory');
	var ctx = java.newInstanceSync('org.renci.ahab.libtransport.PEMTransportContext', "", pem, pem);

	var sliceProxy = java.callMethodSync(ifac, "getSliceProxy", ctx, java.newInstanceSync('java.net.URL', "https://geni.renci.org:11443/orca/xmlrpc"));

	return {
		createSlice: function(topology, callback) {
			var sctx = java.newInstanceSync('org.renci.ahab.libtransport.SliceAccessContext');
			var fac = java.newInstanceSync('org.renci.ahab.libtransport.util.SSHAccessTokenFileFactory', pub, false);
			var t = java.callMethodSync(fac, "getPopulatedToken");
			java.callMethodSync(sctx, "addToken", "root", "root", t);
			java.callMethodSync(sctx, "addToken", "root", t);

			var s = java.callStaticMethodSync("org.renci.ahab.libndl.Slice", 'create', sliceProxy, sctx, topology.toponame);

			for( let node of topology.nodes) {
				var newnode = java.callMethodSync(s, "addComputeNode", node.name);
				java.callMethodSync(newnode, "setImage", "http://geni-images.renci.org/images/standard/centos/centos6.7-v1.1.0/centos6.7-v1.1.0.xml","0c22c525b8a4f0f480f17587557b57a7a111d198","centos6.7-v1.1.0");
				java.callMethodSync(newnode, "setNodeType", node.nodetype);
			//	java.callMethodSync(newnode, "setDomain", "RENCI (Chapel Hill, NC USA) XO Rack");
			//	java.callMethodSync(newnode, "setPostBootScript", "master post boot script");
			}

			java.callMethodSync(s, "commit");

		}
	};
};






















module.exports = ahabfuncs;