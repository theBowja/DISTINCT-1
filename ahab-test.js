var java = require('java');
var fs = require('fs');
var path = require('path');

// java.classpath.push('C:/Users/Eric Xin/Desktop/ahab-master/ahab-master/libndl/src')
java.classpath.pushDir(path.resolve(__dirname, "ahab"));
//java.classpath.push(path.resolve(__dirname, "ahab/*.jar"));
var pem = "C:\\Users\\Eric Xin\\.ssh\\geni-ericxin.pem";
var pub = "C:\\Users\\Eric Xin\\.ssh\\id_geni_ssh_rsa.pub";

var options = process.argv.slice(2);

//var s = java.callStaticMethodSync("org.renci.ahab.libndl.Slice", 'loadManifestFile', sliceProxy, "ericxin.slicex");
for(var i = 0; i < options.length; i++) {
	switch(options[i]) {
		case '-c':
			createSlicewithComputeNodes(options[i+1], options[i+2]);
			i+=2;
			break;

		case '-l':
			listSlices();
			break;

		case '-rdf':
			getRDFString(options[i+1]);
			i+=1;
			break;

		case '-ip':
			getPublicIP(options[i+1], options[i+2]);
			i+=2;
			break;

		case '-e':
			getExtra(options[i+1]);
			i+=1;
			break;

		case '-en':
			getNodeExtra(options[i+1], options[i+2]);
			i+=2;
			break;

	}
}


function createSlicewithComputeNodes(slicename, numofnodes) {
	console.log(slicename);
	var sctx = java.newInstanceSync('org.renci.ahab.libtransport.SliceAccessContext');
	var fac = java.newInstanceSync('org.renci.ahab.libtransport.util.SSHAccessTokenFileFactory', pub, false);
	var t = java.callMethodSync(fac, "getPopulatedToken");
	java.callMethodSync(sctx, "addToken", "xin", "xin", t);
	java.callMethodSync(sctx, "addToken", "xin", t);
	console.log(sctx+"");

	var ifac = java.newInstanceSync('org.renci.ahab.libtransport.xmlrpc.XMLRPCProxyFactory');
	console.log("Opening certificate and key " + pem);
	var ctx = java.newInstanceSync('org.renci.ahab.libtransport.PEMTransportContext', "", pem, pem);

	var sliceProxy = java.callMethodSync(ifac, "getSliceProxy", ctx, java.newInstanceSync('java.net.URL', "https://geni.renci.org:11443/orca/xmlrpc"));
	var s = java.callStaticMethodSync("org.renci.ahab.libndl.Slice", 'create', sliceProxy, sctx, slicename);

	var i;
	for( i = 0; i < numofnodes; i++) {
		newnode = java.callMethodSync(s, "addComputeNode", "ComputeNode"+i);
		java.callMethodSync(newnode, "setImage", "http://geni-images.renci.org/images/standard/centos/centos6.7-v1.1.0/centos6.7-v1.1.0.xml","d91aaef825fa7cf52ce0e4328357b5e2b69046c1","ERICXIN-centos");
		java.callMethodSync(newnode, "setNodeType", "XO Small");
	//	java.callMethodSync(newnode, "setDomain", "RENCI (Chapel Hill, NC USA) XO Rack");
	//	java.callMethodSync(newnode, "setPostBootScript", "master post boot script");
	}

	console.log("testNewSlice1: " + java.callMethodSync(s, "getDebugString"));
	console.log("testNewSlice1: " + java.callMethodSync(s, "getRequest"));

	java.callMethodSync(s, "commit");

	// var node = java.callMethodSync(s, "getResourceByName", "ComputeNode1");
	// if (node ==null)
	// 	return console.log("node " + " not found");
	// console.log("public ip of " + ": " + java.callMethodSync(node, "getManagementIP"));

	//java.callMethodSync(s, "delete");
}

function deleteSlice(slicename) {
	var ifac = java.newInstanceSync('org.renci.ahab.libtransport.xmlrpc.XMLRPCProxyFactory');
	//console.log("Opening certificate " + pem + " and key " + pem);
	var ctx = java.newInstanceSync('org.renci.ahab.libtransport.PEMTransportContext', "", pem, pem);

	var sliceProxy = java.callMethodSync(ifac, "getSliceProxy", ctx, java.newInstanceSync('java.net.URL', "https://geni.renci.org:11443/orca/xmlrpc"));

	var s = java.callStaticMethodSync("org.renci.ahab.libndl.Slice", "loadManifestFile", sliceProxy, slicename);
	java.callMethodSync(s, "delete");
}

function getExtra(slicename) {
	var ifac = java.newInstanceSync('org.renci.ahab.libtransport.xmlrpc.XMLRPCProxyFactory');
	//console.log("Opening certificate " + pem + " and key " + pem);
	var ctx = java.newInstanceSync('org.renci.ahab.libtransport.PEMTransportContext', "", pem, pem);

	var sliceProxy = java.callMethodSync(ifac, "getSliceProxy", ctx, java.newInstanceSync('java.net.URL', "https://geni.renci.org:11443/orca/xmlrpc"));

	var s = java.callStaticMethodSync("org.renci.ahab.libndl.Slice", "loadManifestFile", sliceProxy, slicename);
	console.log("getSliceGraphString: " + java.callMethodSync(s, "getSliceGraphString"));
	console.log("getDebugString: " + java.callMethodSync(s, "getDebugString"));
	console.log("getRequest: " + java.callMethodSync(s, "getRequest"));
}

function getNodeExtra(slicename, nodename) {
	var ifac = java.newInstanceSync('org.renci.ahab.libtransport.xmlrpc.XMLRPCProxyFactory');
	//console.log("Opening certificate " + pem + " and key " + pem);
	var ctx = java.newInstanceSync('org.renci.ahab.libtransport.PEMTransportContext', "", pem, pem);

	var sliceProxy = java.callMethodSync(ifac, "getSliceProxy", ctx, java.newInstanceSync('java.net.URL', "https://geni.renci.org:11443/orca/xmlrpc"));

	var s = java.callStaticMethodSync("org.renci.ahab.libndl.Slice", "loadManifestFile", sliceProxy, slicename);

	var node = java.callMethodSync(s, "getResourceByName", nodename);
	if (node ==null)
		return console.log("node " + nodename + " not found");
	var spaces = ' '.repeat(nodename.length);
	console.log(nodename + ": " + node);
	console.log(spaces + ": " + java.callMethodSync(node, "getName"));
	console.log(spaces + ": " + java.callMethodSync(node, "getDomain"));
	console.log(spaces + ": " + java.callMethodSync(node, "getNodeType"));
	console.log(spaces + ": " + java.callMethodSync(node, "getImageShortName"));
	console.log(spaces + ": " + java.callMethodSync(node, "getImageHash"));
	console.log(spaces + ": " + java.callMethodSync(node, "getImageUrl"));
	console.log(spaces + ": " + java.callMethodSync(node, "getPostBootScript"));

}

function getRDFString(slicename) {
	var ifac = java.newInstanceSync('org.renci.ahab.libtransport.xmlrpc.XMLRPCProxyFactory');
	//console.log("Opening certificate " + pem + " and key " + pem);
	var ctx = java.newInstanceSync('org.renci.ahab.libtransport.PEMTransportContext', "", pem, pem);

	var sliceProxy = java.callMethodSync(ifac, "getSliceProxy", ctx, java.newInstanceSync('java.net.URL', "https://geni.renci.org:11443/orca/xmlrpc"));

	var s = java.callStaticMethodSync("org.renci.ahab.libndl.Slice", "loadManifestFile", sliceProxy, slicename);
	console.log("testNewSlice1: " + java.callMethodSync(s, "getDebugString"));	
	console.log("testNewSlice1: " + java.callMethodSync(s, "getRequest"));

}

function getPublicIP(slicename, nodename) {
	var ifac = java.newInstanceSync('org.renci.ahab.libtransport.xmlrpc.XMLRPCProxyFactory');
	//console.log("Opening certificate " + pem + " and key " + pem);
	var ctx = java.newInstanceSync('org.renci.ahab.libtransport.PEMTransportContext', "", pem, pem);

	var sliceProxy = java.callMethodSync(ifac, "getSliceProxy", ctx, java.newInstanceSync('java.net.URL', "https://geni.renci.org:11443/orca/xmlrpc"));
	
	var s = java.callStaticMethodSync("org.renci.ahab.libndl.Slice", "loadManifestFile", sliceProxy, slicename);
	var node = java.callMethodSync(s, "getResourceByName", nodename);
	if (node ==null)
		return console.log("node " + nodename + " not found");
	console.log("public ip of " + nodename + ": " + java.callMethodSync(node, "getManagementIP"));
}


function listSlices() {
	// test addcomputenode
	var ifac = java.newInstanceSync('org.renci.ahab.libtransport.xmlrpc.XMLRPCProxyFactory');
	console.log("Opening certificate " + pem + " and key " + pem);
	var ctx = java.newInstanceSync('org.renci.ahab.libtransport.PEMTransportContext', "", pem, pem);

	var sliceProxy = java.callMethodSync(ifac, "getSliceProxy", ctx, java.newInstanceSync('java.net.URL', "https://geni.renci.org:11443/orca/xmlrpc"));
	console.log(java.callMethodSync(sliceProxy, "listMySlices"));
}

console.log("finished running code");