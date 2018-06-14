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
		case '-c': case '-create': // create
			createSlicewithComputeNodes(options[i+1], options[i+2]);
			i+=2;
			break;

		case '-l': case '-list': // list
			listSlices();
			break;

		case '-rdf': // rdf
			getRDFString(options[i+1]);
			i+=1;
			break;

		case '-ip': // public ip
			getPublicIP(options[i+1], options[i+2]);
			i+=2;
			break;

		case '-s': case '-status': // status
			getStatus(options[i+1]);
			i+=1;
			break;

		case '-i': case '-info': // info
			getExtra(options[i+1]);
			i+=1;
			break;

		case '-in': case '-infonode': // info node
			getNodeExtra(options[i+1], options[i+2]);
			i+=2;
			break;

		case '-d': case '-delete': // delete slice
			deleteSlice(options[i+1]);
			i+=1;
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

	var sliceProxy = getSliceProxy();
	var s = java.callStaticMethodSync("org.renci.ahab.libndl.Slice", 'create', sliceProxy, sctx, slicename);

	var i;
	for( i = 0; i < numofnodes; i++) {
		newnode = java.callMethodSync(s, "addComputeNode", "ComputeNode"+i);
		java.callMethodSync(newnode, "setImage", "http://geni-images.renci.org/images/standard/centos/centos6.7-v1.1.0/centos6.7-v1.1.0.xml","0c22c525b8a4f0f480f17587557b57a7a111d198","centos6.7-v1.1.0");
		java.callMethodSync(newnode, "setNodeType", "XO Small");
	//	java.callMethodSync(newnode, "setDomain", "RENCI (Chapel Hill, NC USA) XO Rack");
	//	java.callMethodSync(newnode, "setPostBootScript", "master post boot script");
	}

	console.log("testNewSlice1: " + java.callMethodSync(s, "getDebugString"));
	console.log("testNewSlice1: " + java.callMethodSync(s, "getRequest"));

	java.callMethodSync(s, "commit");
}

function deleteSlice(slicename) {
	var sliceProxy = getSliceProxy();

	var s = java.callStaticMethodSync("org.renci.ahab.libndl.Slice", "loadManifestFile", sliceProxy, slicename);
	java.callMethodSync(s, "delete");
}

function getStatus(slicename) {
	var sliceProxy = getSliceProxy();
	console.log("getStatus: " + java.callMethodSync(sliceProxy, 'sliceStatus', slicename));
}

function getExtra(slicename) {
	var sliceProxy = getSliceProxy();

	var s = java.callStaticMethodSync("org.renci.ahab.libndl.Slice", "loadManifestFile", sliceProxy, slicename);
	console.log("getSliceGraphString: " + java.callMethodSync(s, "getSliceGraphString"));
	console.log("getDebugString: " + java.callMethodSync(s, "getDebugString"));
	console.log("getRequest: " + java.callMethodSync(s, "getRequest"));
}

function getNodeExtra(slicename, nodename) {
	var sliceProxy = getSliceProxy();

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
	var sliceProxy = getSliceProxy();

	var s = java.callStaticMethodSync("org.renci.ahab.libndl.Slice", "loadManifestFile", sliceProxy, slicename);
	console.log("testNewSlice1: " + java.callMethodSync(s, "getDebugString"));	
	console.log("testNewSlice1: " + java.callMethodSync(s, "getRequest"));

}

function getPublicIP(slicename, nodename) {
	var sliceProxy = getSliceProxy();

	var s = java.callStaticMethodSync("org.renci.ahab.libndl.Slice", "loadManifestFile", sliceProxy, slicename);
	var node = java.callMethodSync(s, "getResourceByName", nodename);
	if (node ==null)
		return console.log("node " + nodename + " not found");
	console.log("public ip of " + nodename + ": " + java.callMethodSync(node, "getManagementIP"));
}


function listSlices() {
	var sliceProxy = getSliceProxy();
	console.log(java.callMethodSync(sliceProxy, "listMySlices"));
}

function getSliceProxy() {
	var ifac = java.newInstanceSync('org.renci.ahab.libtransport.xmlrpc.XMLRPCProxyFactory');
	console.log("Opening certificate " + pem + " and key " + pem);
	var ctx = java.newInstanceSync('org.renci.ahab.libtransport.PEMTransportContext', "", pem, pem);

	var sliceProxy = java.callMethodSync(ifac, "getSliceProxy", ctx, java.newInstanceSync('java.net.URL', "https://geni.renci.org:11443/orca/xmlrpc"));
	return sliceProxy;
}

console.log("finished running code");