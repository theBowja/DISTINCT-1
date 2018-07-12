var java = require('java');
var fs = require('fs');
var path = require('path');

var Promise = require('bluebird');

// var Promise = require('bluebird');
java.asyncOptions = {
	syncSuffix: "Sync",
	asyncSuffix: "",
	promiseSuffix: "Promise",
	promisify: require('bluebird').promisify
};

java.ensureJvm(function(err) {
	if(err) return console.log(err);
	evaluateOptions();
	//createSlicePromise();
	//listSlicesAsync();
});

// java.classpath.push('C:/Users/Eric Xin/Desktop/ahab-master/ahab-master/libndl/src')
java.classpath.pushDir(path.resolve(__dirname, "ahab"));
//java.classpath.push(path.resolve(__dirname, "ahab/*.jar"));
var pem = "C:\\Users\\Eric Xin\\.ssh\\geni-ericxin.pem";
var pub = "C:\\Users\\Eric Xin\\.ssh\\id_geni_ssh_rsa.pub";

var options = process.argv.slice(2);

function evaluateOptions() {
	for(var i = 0; i < options.length; i++) {
		switch(options[i]) {
			case '-c': case '-create': // create
				createSlicewithComputeNodes(options[i+1], options[i+2]);
				i+=2;
				break;

			case '-createP': case '-createPromise': // create except using promises
				createSlicePromise(options[i+1]);
				i+=1;
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

			case '-m': case '-manifest': // manifest
				getManifest(options[i+1]);
				i+=1;
				break;

			case '-si': case '-sliceinfo': // slice info
				getSliceInfo(options[i+1]);
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

			case '-test':
				test();
				break;
		}
	}
	console.log("options finished evaluating");
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

	var net = java.callMethodSync(s, "addBroadcastLink", "Link1");

	var node1 = java.callMethodSync(s, "getResourceByName", "ComputeNode0");
	var node2 = java.callMethodSync(s, "getResourceByName", "ComputeNode1");
	java.callMethodSync(net, "stitch", node1);
	java.callMethodSync(net, "stitch", node2);

	// console.log("testNewSlice1: " + java.callMethodSync(s, "getDebugString"));
	// console.log("testNewSlice1: " + java.callMethodSync(s, "getRequest"));

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

function getManifest(slicename) {
	var sliceProxy = getSliceProxy();
	var manifest = java.callMethodSync(sliceProxy, 'sliceStatus', slicename);
	var fs = require('fs');
	var fpath = 'tmp/' + slicename + '.txt';
	fs.writeFile(fpath, manifest, function() {
		console.log('manifest done: ' + fpath);
	});
}

function listSlices() {
	var sliceProxy = getSliceProxy();
	console.log(java.callMethodSync(sliceProxy, "listMySlices"));
}

function getSliceProxy() {
	var ifac = java.newInstanceSync('org.renci.ahab.libtransport.xmlrpc.XMLRPCProxyFactory');
	//console.log(ifac);
	//console.log("Opening certificate " + pem + " and key " + pem);
	var ctx = java.newInstanceSync('org.renci.ahab.libtransport.PEMTransportContext', "", pem, pem);

	var url = java.newInstanceSync('java.net.URL', "https://geni.renci.org:11443/orca/xmlrpc");
	var sliceProxy = java.callMethodSync(ifac, "getSliceProxy", ctx, java.newInstanceSync('java.net.URL', "https://geni.renci.org:11443/orca/xmlrpc"));
	return sliceProxy;
}

function getSliceInfo(slicename) {
	var sliceProxy = getSliceProxy();
	var s = java.callStaticMethodSync("org.renci.ahab.libndl.Slice", "loadManifestFile", sliceProxy, slicename);
	var funcs = ["getAllResources", "getInterfaces", "getLinks", "getBroadcastLinks", "getNodes", "getComputeNodes", "getStorageNodes", "getStitchPorts"];

	for(let f of funcs) {
		console.log(f + ": " + java.callMethodSync(s, f).toStringSync());
	}
}

function test() {
	var sliceProxy = getSliceProxy();
	var manifest = java.callMethodSync(sliceProxy, 'sliceStatus', 'excross2');
	//console.log(manifest);
	var fs = require('fs');
	fs.writeFile('tmp/manifest.txt', manifest, function() {
		console.log('manifest done: tmp/manifest.txt');
	})

	/*
	var sctx = java.newInstanceSync('org.renci.ahab.libtransport.SliceAccessContext');
	var fac = java.newInstanceSync('org.renci.ahab.libtransport.util.SSHAccessTokenFileFactory', pub, false);
	var t = java.callMethodSync(fac, "getPopulatedToken");
	java.callMethodSync(sctx, "addToken", "xin", "xin", t);
	java.callMethodSync(sctx, "addToken", "xin", t);
	console.log(sctx+"");

	var sliceProxy = getSliceProxy();
	var s = java.callStaticMethodSync("org.renci.ahab.libndl.Slice", 'create', sliceProxy, sctx, 'excross2');

	var n1 = java.callMethodSync(s, "addComputeNode", "ComputeNode0");
	java.callMethodSync(n1, "setImage", "http://geni-images.renci.org/images/standard/centos/centos6.7-v1.1.0/centos6.7-v1.1.0.xml","0c22c525b8a4f0f480f17587557b57a7a111d198","centos6.7-v1.1.0");
	java.callMethodSync(n1, "setNodeType", "XO Small");
	java.callMethodSync(n1, "setDomain", "RENCI (Chapel Hill, NC USA) XO Rack");

	var n2 = java.callMethodSync(s, "addComputeNode", "ComputeNode1");
	java.callMethodSync(n2, "setImage", "http://geni-images.renci.org/images/standard/centos/centos6.7-v1.1.0/centos6.7-v1.1.0.xml","0c22c525b8a4f0f480f17587557b57a7a111d198","centos6.7-v1.1.0");
	java.callMethodSync(n2, "setNodeType", "XO Small");
	java.callMethodSync(n2, "setDomain", "UvA (Amsterdam, The Netherlands) XO Rack");



	var net = java.callMethodSync(s, "addBroadcastLink", "Link1");

	var node1 = java.callMethodSync(s, "getResourceByName", "ComputeNode0");
	var node2 = java.callMethodSync(s, "getResourceByName", "ComputeNode1");
	java.callMethodSync(net, "stitch", node1);
	java.callMethodSync(net, "stitch", node2);


	java.callMethodSync(s, "commit");
	/*


	//getSliceInfo();
	// get state of node
	// var sliceProxy = getSliceProxy();
	// var s = java.callStaticMethodSync("org.renci.ahab.libndl.Slice", "loadManifestFile", sliceProxy, 'exslice1');

	// //var cn = java.callMethodSync(s, 'getResourceByName', 'ComputeNode0');
	// //ar mn = java.callMethodSync(cn, 'getManifestNodes');
	// var resourcesStr = java.callMethodSync(s, 'getAllResources').toStringSync()
	// var resources = resourcesStr.slice(1, -1).replace(/ /g,'').split(',');
	// console.log(resources);
	// // /console.log(java.callMethodSync(s, 'getAllResources').toStringSync().slice(1,-1).split(','))
	// for(let r of resources) {
	// 	var cn = java.callMethodSync(s, 'getResourceByName', r);
	// 	var state = java.callMethodSync(cn, 'getState');
	// 	console.log(r + ": " + state);
	// }

	//console.log(java.callMethodSync(cn, 'getState'));



	/* // add link
	var sliceProxy = getSliceProxy();
	var s = java.callStaticMethodSync("org.renci.ahab.libndl.Slice", "loadManifestFile", sliceProxy, "exslice2");

	var node1 = java.callMethodSync(s, "getResourceByName", "ComputeNode0");
	var node2 = java.callMethodSync(s, "getResourceByName", "ComputeNode1");
	var net = java.callMethodSync(s, "addBroadcastLink", "Link2");

	java.callMethodSync(net, "stitch", node1);
	java.callMethodSync(net, "stitch", node2);

	console.log("getRequest: " + java.callMethodSync(s, "getRequest"));

	java.callMethodSync(s, "commit");
	*/
}

console.log("finished running code");