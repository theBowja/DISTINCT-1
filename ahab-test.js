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

function listSlicesAsync() {
	console.log("listSlicesAsync()");
	//var ifac = java.newInstanceSync('org.renci.ahab.libtransport.xmlrpc.XMLRPCProxyFactory');

	var ifacP = java.newInstancePromise('org.renci.ahab.libtransport.xmlrpc.XMLRPCProxyFactory');
	var ctxP = java.newInstancePromise('org.renci.ahab.libtransport.PEMTransportContext', "", pem, pem);
	var urlP = java.newInstancePromise('java.net.URL', 'https://geni.renci.org:11443/orca/xmlrpc');
	var p1 = Promise.all([ifacP, ctxP, urlP])
		.then( function([ifac, ctx, url]) {
			return java.callMethodSync(ifac, "getSliceProxy", ctx, url);
		})
		.then( function(sliceProxy) {
			//console.log(sliceProxy);
			return java.callMethodSync(sliceProxy, "listMySlices");
		})
		.then( function(list) {
			console.log(list);
		})
		.catch(function(err) {
			console.log(err);
		});

	// console.log("callback h");
	// var ifac = null;
	// var ctx = null;
	// var url = null;

	// java.newInstance('org.renci.ahab.libtransport.xmlrpc.XMLRPCProxyFactory', function(err, instance) {
	// 	if (err) return console.log("1:"+err);
	// 	ifac = instance;
	// 	complete();
	// });
	// java.newInstance('org.renci.ahab.libtransport.PEMTransportContext', "", pem, pem, function(err, instance) {
	// 	if (err) return console.log("2:"+err);
	// 	ctx = instance;
	// 	complete();
	// });
	// java.newInstance('java.net.URL', "https://geni.renci.org:11443/orca/xmlrpc", function(err, instance) {
	// 	if (err) return console.log("3:"+err);
	// 	url = instance;
	// 	complete();
	// });

	// function complete() {
	// 	if (ifac === null || ctx === null || url === null) return;
	// 	//console.log(ifac);
	// 	java.callMethod(ifac, 'getSliceProxy', ctx, url, function(err, sliceProxy) {
	// 		if (err) return console.log("4:"+err);
	// 		console.log(ifac);
	// 		java.callMethodSync(sliceProxy, "listMySlices")
	// 		// java.callMethod(sliceProxy, 'listMySlices', function(err, list) {
	// 		// 	if (err) return console.log("5:"+err);
	// 		// 	console.log(list);
	// 		// });
	// 	});
	// }

	// java.newInstance('org.renci.ahab.libtransport.xmlrpc.XMLRPCProxyFactory', function(err, ifac) {
	// 	if (err) return console.log("1: "+err);

	// 	java.newInstance('org.renci.ahab.libtransport.PEMTransportContext', "", pem, pem, function(err, ctx) {
	// 		if (err) return console.log("2: "+err);

	// 		java.newInstance('java.net.URL', "https://geni.renci.org:11443/orca/xmlrpc", function(err, url) {
	// 			if (err) return console.log("3: "+err);

	// 			java.callMethod(ifac, 'getSliceProxy', ctx, url, function(err, sliceProxy) {
	// 				if (err) return console.log("4: "+err);
	// 					console.log(sliceProxy);
	// 					// var ifac = java.newInstanceSync('org.renci.ahab.libtransport.xmlrpc.XMLRPCProxyFactory');
	// 					// var ctx = java.newInstanceSync('org.renci.ahab.libtransport.PEMTransportContext', "", pem, pem);
	// 					// var url = java.newInstanceSync('java.net.URL', "https://geni.renci.org:11443/orca/xmlrpc");
	// 					//var sliceProxy = java.callMethodSync(ifac, "getSliceProxy", ctx, url);

	// 					java.callMethod(sliceProxy, "listMySlices", function(err, list) {
	// 						if (err) return console.log("5: "+err);
	// 						return console.log(list);
	// 					});
	// 					//console.log(java.callMethodSync(sliceProxy, "listMySlices"));
	// 			});
	// 		});
	// 	});
	// });

}

// java.ensureJvm(function(err) {
// 	console.log("ensurejvm");
// 	if(err) return console.log(err);
// 	listSlicesAsync();
// });

//listSlicesAsync();

// setTimeout(function() {
// 	listSlicesAsync();
// }, 5000);

function promisemeplease() {


	var ifacP = java.newInstancePromise('org.renci.ahab.libtransport.xmlrpc.XMLRPCProxyFactory');
	var ctxP = java.newInstancePromise('org.renci.ahab.libtransport.PEMTransportContext', "", pem, pem);
	var urlP = java.newInstancePromise('java.net.URL', 'https://geni.renci.org:11443/orca/xmlrpc');
	var p1 = Promise.all([ifacP, ctxP, urlP])
		.then( function([ifac, ctx, url]) {
			return java.callMethodPromise(ifac, "getSliceProxy", ctx, url);
		})
		.then( function(sliceProxy) {
			return java.callMethodPromise(sliceProxy, "listMySlices");
		})
		.then( function(list) {
			console.log(list);
		})
		.catch(function(err) {
			console.log(err);
		});
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

function createSlicePromise(slicename, numofnodes) {
	var sliceProxy = getSliceProxy();

	var sctxP = java.newInstancePromise('org.renci.ahab.libtransport.SliceAccessContext');
	var facP = java.newInstancePromise('org.renci.ahab.libtransport.util.SSHAccessTokenFileFactory', pub, false);
	var tP = facP.then(function(fac) {
		return java.callMethodPromise(fac, "getPopulatedToken");
	});
	var sP = Promise.all([sctxP, tP])
	.spread(function(sctx, t) {
		return Promise.all([sctxP, java.callMethodPromise(sctx, "addToken", "root", "root", t), 
								   java.callMethodPromise(sctx, "addToken", "root", t)]);
	})
	.spread(function(sctx) {
		return java.callStaticMethodPromise('org.renci.ahab.libndl.Slice', 'create', sliceProxy, sctx, slicename);
	});

	var nodesP = sP.then(function(s) { // add all nodes
		var nodes = [{ name:"ComputeNode1", nodetype:"XO Small"}, {name:"ComputeNode2", nodetype:"XO Small"}];

		return Promise.map(nodes, function(node) {
			return java.callMethodPromise(s, 'addComputeNode', node.name).then(function(newnode) {
				return Promise.all([java.callMethodPromise(newnode, "setImage", "http://geni-images.renci.org/images/standard/centos/centos6.7-v1.1.0/centos6.7-v1.1.0.xml","0c22c525b8a4f0f480f17587557b57a7a111d198","centos6.7-v1.1.0"),
									java.callMethodPromise(newnode, "setNodeType", node.nodetype) ]);
			});
		});
	});

	// var commitP = Promise.all([sP, nodesP])
	// .spread(function(s, links) {
	// 	return java.callMethodSync(s, 'commit');
	// });

	// var linksP = Promise.all([sP, nodesP])
	// .spread(function(s, nodes) {
	// 	var links = [{Name:"Link1", Source:"ComputeNode1", Target:"ComputeNode2"}];
	// 	var link = links[0];
	// 	// var net = java.callMethodSync(s, "addBroadcastLink", link.Name);

	// 	// var node1 = java.callMethodSync(s, "getResourceByName", link.Source);
	// 	// var node2 = java.callMethodSync(s, "getResourceByName", link.Target);
	// 	// java.callMethodSync(net, "stitch", node1);
	// 	// java.callMethodSync(net, "stitch", node2);
	// 	// return true;

	// 	return Promise.map(links, function(link) {
	// 		var node1P = java.callMethodPromise(s, "getResourceByName", link.Source);
	// 		var node2P = java.callMethodPromise(s, "getResourceByName", link.Target);
	// 		var netP = java.callMethodPromise(s, "addBroadcastLink", link.Name);

	// 		return Promise.all([node1P, node2P, netP]).spread(function(node1, node2, net) {
	// 			return Promise.all([java.callMethodPromise(net, "stitch", node1),
	// 								java.callMethodPromise(net, "stitch", node2)]);
	// 		});
	// 	});
	// });


	Promise.all([sP, nodesP])
	.spread(function(s, links) {

		var net = java.callMethodSync(s, "addBroadcastLink", "Link1");

		var node1 = java.callMethodSync(s, "getResourceByName", "ComputeNode1");
		var node2 = java.callMethodSync(s, "getResourceByName", "ComputeNode2");
		java.callMethodSync(net, "stitch", node1);
		java.callMethodSync(net, "stitch", node2);
		return java.callMethodSync(s, 'commit');
	});
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
	//console.log(ifac);
	//console.log("Opening certificate " + pem + " and key " + pem);
	var ctx = java.newInstanceSync('org.renci.ahab.libtransport.PEMTransportContext', "", pem, pem);

	var url = java.newInstanceSync('java.net.URL', "https://geni.renci.org:11443/orca/xmlrpc");
	var sliceProxy = java.callMethodSync(ifac, "getSliceProxy", ctx, java.newInstanceSync('java.net.URL', "https://geni.renci.org:11443/orca/xmlrpc"));
	return sliceProxy;
}

function getSliceInfo(slicename) {
	var sliceProxy = getSliceProxy();
	var s = java.callStaticMethodSync("org.renci.ahab.libndl.Slice", "loadManifestFile", sliceProxy, 'exslice1');
	var funcs = ["getAllResources", "getInterfaces", "getLinks", "getBroadcastLinks", "getNodes", "getComputeNodes", "getStorageNodes", "getStitchPorts"];

	for(let f of funcs) {
		console.log(f + ": " + java.callMethodSync(s, f).toStringSync());
	}
}

function test() {
	getSliceInfo();
	// get state of node
	var sliceProxy = getSliceProxy();
	var s = java.callStaticMethodSync("org.renci.ahab.libndl.Slice", "loadManifestFile", sliceProxy, 'exslice1');

	//var cn = java.callMethodSync(s, 'getResourceByName', 'ComputeNode0');
	//ar mn = java.callMethodSync(cn, 'getManifestNodes');
	console.log(java.callMethodSync(s, 'getAllResources').toStringSync());
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