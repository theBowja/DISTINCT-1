# Documentation

This is the documentation for the code. Warning: documentation may not be completely up-to-date with the code. Each section will have a more detailed table of contents.

Table of contents
=================

* [Documentation](#documentation)
* [Table of Contents](#table-of-contents)
* [MySQL Table Schemas](#mysql-table-schemas)
* [dbfuncs.js](#dbfuncsjs)
* [ahabfuncs.js](#ahabfuncsjs)
* [API routes](#api-routes)
* [Editor](#editor)

## MySQL Table Schemas

Can be found in [**database/schema.js**](../database/schema.js) and tables will be automatically created when you start the server. however if you make changes in the file for the definitions, you will have to delete the corresponding tables manually/modify data.

* [user](#user-table)
* [topology](#topology-table)
* [permission](#permission-table)
* [slice](#slice-table)
* [resource](#resource-table)
* [reservation](#reservation-table)

### user table
Contains basic information for the user.
```
user (
	Id INT NOT NULL AUTO_INCREMENT,
	username VARCHAR(40) NOT NULL,
	email VARCHAR(255) NOT NULL,
	password CHAR(60) BINARY NOT NULL,
	role ENUM('admin', 'user') DEFAULT 'user' NOT NULL,

	UNIQUE (username),
	PRIMARY KEY (Id)
) ENGINE=InnoDB
```

### topology table
Just the name of the topology and the file name it is saved under by the server. Can probably be combined into the permission table.
```topology (
	Id INT NOT NULL AUTO_INCREMENT,
	toponame VARCHAR(50) NOT NULL,
	location VARCHAR(63) NOT NULL,

	UNIQUE (location),
	PRIMARY KEY (Id)
) ENGINE=InnoDB
```

### permission table
Controls which topologies a user can access. This means a topology can be shared with other users (unimplemented).
```permission (
	Id INT NOT NULL AUTO_INCREMENT,

	userid INT NOT NULL,
	role ENUM('owner', 'readonly', 'readwrite') NOT NULL DEFAULT 'readwrite',
	topoid INT NOT NULL,

	FOREIGN KEY (userid) REFERENCES user(Id) ON DELETE CASCADE,
	FOREIGN KEY (topoid) REFERENCES topology(Id) ON DELETE CASCADE,
	PRIMARY KEY (Id)
) ENGINE=InnoDB
```

### slice table
Slice.
```slice (
	Id INT NOT NULL AUTO_INCREMENT,

	slicename VARCHAR(63) NOT NULL,

	userid INT NOT NULL,
	isDelayed BOOLEAN NOT NULL,

	topoloc VARCHAR(63) NOT NULL,
	pemname VARCHAR(63) NOT NULL,
	pemloc VARCHAR(63) NOT NULL,
	pubname VARCHAR(63) NOT NULL,
	publoc VARCHAR(63) NOT NULL,

	expiration DATETIME NOT NULL,

	FOREIGN KEY (userid) REFERENCES user(Id) ON DELETE CASCADE,

	PRIMARY KEY (Id)
) ENGINE=InnoDB
```

### resource table
Available powergrid resources. 
```resource (
	Id INT NOT NULL AUTO_INCREMENT,

	resname VARCHAR(63) NOT NULL,
	stitchport VARCHAR(63) NOT NULL,

	PRIMARY KEY (Id)
) ENGINE=InnoDB
```

### reservation table
```reservation (
	Id INT NOT NULL AUTO_INCREMENT,

	sliceid INT NOT NULL,
	resourceid INT NOT NULL,

	start DATETIME NOT NULL,
	end DATETIME NOT NULL,

	FOREIGN KEY (sliceid) REFERENCES slice(Id) ON DELETE CASCADE,
	FOREIGN KEY (resourceid) REFERENCES resource(Id) ON DELETE CASCADE,
	PRIMARY KEY (Id)
) ENGINE=InnoDB
```

## Development

Middlewares - body-parser, express-session, connect-cloudant-store, multer, multer-autoreap

### app.js
This application is generated with the [Express.js boilerplate generator](https://expressjs.com/en/starter/generator.html). Near the top, *database.js* is first required and initialized. [Pug](https://pugjs.org) is then set as the template engine in the Express framework. Following that are the middlewares. When adding middlewares, one must be careful of the order they put them in, else errors may occur. The order of the routes are also imporant as it affects which middlewares used in the application’s request-response cycle. The base routes here are test routes and should be "decomissioned" when going into production.

- Every hour, expired sessions will be cleaned up. (**app.js**)(doesn't work currently :/)
- Every half hour, expired events on scheduler will be cleaned up. (**database.js**) (unimplemented)

## Development - 'database' folder
Lack of better naming. Contains functions for database (in dbfuncs.js), for files (in fsfuncs.js), and for ahab (in ahabfuncs.js).

# dbfuncs.js
functions for database
```
var dbfuncs = require('relative/path/dbfuncs.js')
```
* [USER](#user)
  * [login(username, password, callback)](#loginusername-password-callback)
  * [createuser(username, email, password, role, callback)](#createuserusername-email-password-role-callback)
* [PERMISSION](#permission)
  * [getPermission(userid, topoid, callback)](#getPermissionuserid-topoid-callback)
  * [getPermissionbyLocation(userid, location, callback)](#getPermissionbyLocationuserid-location-callback)
  * [updatePermission(role, callback)](#updatePermissionrole-callback)
  * [getIdbyLocation(location, callback)](#getIdbyLocationlocation-callback)
* [TOPOLOGY](#topology)
  * [getTopology(topoid, callback)](#getTopologytopoid-callback)
  * [getTopologybyLocation(location, callback)](#getTopologybyLocationlocation-callback)
  * [listTopologies(userid, callback)](#listTopologiesuserid-callback)
  * [createTopology(userid, toponame, callback)](#createTopologyuserid-toponame-callback)
  * [updateTopology(topoid, toponame, callback)](#updateTopologytopoid-toponame-callback)
  * [deleteTopology(topoloc, callback)](#deleteTopologytopoloc-callback)
* [SLICE](#slice)
  * [listSlices(userid, callback)](#listSlicesuserid-callback)
  * [listActiveSlices(userid, callback)](#listActiveSlicesuserid-callback)
  * [listDelayedSlices(userid, callback)](#listDelayedSlicesuserid-callback)
  * [addFile(filename, location, callback)](#addFilefilename-location-callback)
  * [addSlice(sliceobj, callback)](#addSlicesliceobj-callback)
  * [deleteSlice(userid, sliceid, callback)](#deleteSliceuserid-sliceid-callback)
  * [getSlice(userid, sliceid, callback)](#getSliceuserid-sliceid-callback)
* [SCHEDULER](#scheduler)
  * [listAllReservations(callback)](#listAllReservationscallback)
  * [listUserReservations(userid, callback)](#listUserReservationsuserid-callback)
  * [addReservation(userid, resources, slicename, start, end, callback)](#addReservationuserid-resources-slicename-start-end-callback)
  * [deleteReservation(userid, rsvnid, callback)](#deleteReservationuserid-rsvnid-callback)
  * [updateReservationResource(userid, rsvnid, resources, callback)](#updateReservationResourceuserid-rsvnid-resources-callback)
  * [updateReservationTime(userid, rsvnid, start, end, callback)](#updateReservationTimeuserid-rsvnid-start-end-callback)
* [RESOURCE](#resource)
  * [listResources(callback)](#listResourcescallback)
  * [addResource(resname, stitchport, callback)](#addResourceresname-stitchport-callback)
  * [deleteResource(resoid, callback)](#deleteResourceresoid-callback)
### USER
Functions relating to user.
#### login(username, password, callback)
Verifies the login with username and plaintextpassword. Returns a user object containing the properties: id, username, and role to be saved in the session.

#### createuser(username, email, password, role, callback)
Creates a new user.

### PERMISSION
#### getPermission(userid, topoid, callback)
#### getPermissionbyLocation(userid, location, callback)
#### updatePermission(role, callback)
#### getIdbyLocation(location, callback)

### TOPOLOGY
#### getTopology(topoid, callback)
#### getTopologybyLocation(location, callback)
#### listTopologies(userid, callback)
#### createTopology(userid, toponame, callback)
#### updateTopology(topoid, toponame, callback)
#### deleteTopology(topoloc, callback)

### SLICE
#### listSlices(userid, callback)
#### listActiveSlices(userid, callback)
#### listDelayedSlices(userid, callback)
#### addFile(filename, location, callback)
#### addSlice(sliceobj, callback)
#### deleteSlice(userid, sliceid, callback)
#### getSlice(userid, sliceid, callback)

### RESERVATION
#### listAllReservations(callback)
#### listUserReservations(userid, callback)
#### addReservation(userid, resources, slicename, start, end, callback)
#### deleteReservation(userid, rsvnid, callback)
#### updateReservationResource(userid, rsvnid, resources, callback)
#### updateReservationTime(userid, rsvnid, start, end, callback)

### RESOURCE
#### listResources(callback)
#### addResource(resname, stitchport, callback)
#### deleteResource(resoid, callback)

## ahabfuncs.js
Functions for calling GENI API through ahab. Since these functions are blocking, it is advisable to use child process. The following code shows an example.
```
var { fork } = require('child_process');
const ahabfuncs = fork('relative/path/ahabfuncs.js', [parameters]);
ahabfuncs.on('message', function(result) { // 
	res.send(result);
});
ahabfuncs.on('error', function(err) {
	res.sendStatus(500);
});
ahabfuncs.send('ahabfunctionname'); // name of the function in ahabfuncs.js to call (see list below).
```
* [createSlice(pem, pub, topopath)](#createSlicepem-pub-topopath)
* [deleteSlice(pem, slicename)](#deleteSlicepem-slicename)
* [listSlices(pem)](#listSlicespem)
* [listResources(pem, slicename)](#listResourcespem-slicename)
* [listResourceStatuses(pem, slicename)](#listResourceStatusespem-slicename)
* [getSliceProxy(pem)](#getSliceProxypem)

#### createSlice(pem, pub, topopath)
#### deleteSlice(pem, slicename)
#### listSlices(pem)
#### listResources(pem, slicename)
#### listResourceStatuses(pem, slicename)
#### getSliceProxy(pem)

# API routes
Description goes here
```
sample code
```
* [topo.js](#topojs)
  * [GET /api/topo/:topoloc](#get-apitopotopoloc)
  * [POST /api/topo/:topoloc](#post-apitopotopoloc)
  * [DELETE /api/topo/:topoloc](#delete-apitopotopoloc)
  * [GET /api/listtopologies](#get-apilisttopologies)
* [reservation.js](#reservationjs)
  * routes
* [resources.js](#resourcesjs)
  * routes
* [slice.js](#slicejs)
  * routes
* [ahab.js](#ahabjs)

## topo.js
Description goes here.

### GET /api/topo/:topoloc
### POST /api/topo/:topoloc
### DELETE /api/topo/:topoloc
### GET /api/listtopologies

## reservation.js
Description goes here.

### GET /api/listreservations
### GET /api/listmyreservations
### POST /api/rsvn/:slicename
### DELETE /api/rsvn/:rsvnid

## resources.js
Description goes here.

### GET /api/listresources
### GET /api/listresources-fs
### POST /api/addresource
### DELETE /api/deleteresource/:resoid

## slice.js
Description goes here.

### GET /api/listslices
### GET /api/listactiveslices
### GET /api/listdelayedslices
### GET /api/listresources/:slicename
### POST /api/createslice/:topoloc
### DELETE /api/deleteslice/:sliceid

## ahab.js
Description goes here.

### DELETE /api/:slicename
### GET /api/listslices
etc TBD

## Development - views folder
Under the views folder. Pug files are compiled and sent to client responses. 

# Editor
Instructions on how to use the editor is listed in the .pug template file.

### \#svgfocus
This element deals with the focus on the SVG. Specifically, keycodes.
- case 27: // ESCAPE - for deselecting everything
- case 46: // DELETE - for deleting selected nodes/links

### control
The object that stores and controls the state of the simulation. Pretty much miscellaneous stuff.

### Options Panel - (function(shapesIndex){...})
Parameter **shapesIndex**: an object array of shapes that can be created. ```["circle", "cross", "diamond", "square", "star", "triangle", "wye"]```. Returns the function **createNodeOptionsPanel**.
An interface to allow editing the data of nodes/links. **svgeditor_optionspanel.js** contains a closure for some reason...

#### Creating editable properties
These schemas are split into base and the rest of the shapes. Base includes the array of specified editable properties that all shapes will have, "name" and "color". In order to add your own custom editable property, the object must have **label** and **type**. **Type** is the type of DOM element it will be, which is limited to "input", "select", and "textarea". Additional types must be specified in the ```switch(trait.type) { ... }``` that is in the function createNodeOptionsPanel. If the type is a "select", then an additional array property called "options" is required as well. **update** is an optional function you can include to change other stuff; otherwise, only the data attribute will be updated. The **update** function may have up to three parameters: formdata, node, panel. Formdata is the new data submitted. node is the d3 selection of the relevant node. panel refers to the options panel of the node.

#### svgeditor_optionspanel.js - getShape(s)
returns the relevant element in the shapes array

### Toolbox
A clipPath specifies the boundaries of the toolbox. Each icon of the toolbox is 24px x 24px.
Stpes to add your own icon with functionality:
1. expand the height of the clipPath boundary by 24
2. follow the pattern of mediabutton/interationbutton/shapebutton

#### Toolbox - toolboxButtonMaker(name,transform)
Given the parameters provided, this function will create and return a button to fit in the toolbox. The *name* is used to set the id of the elements: "[name]-title" and "[name]-path". The *transform* is used to set the transform.

### topologySchema
A schema to verify the json of the topology. Uses AJV as its JSON Schema validator. The topology object must contain the array properties: "nodes" and "links". Each object element in the array "nodes" must have a property: "name". Each object element in the array "links" must have the properties: "source" and "target" which reference to an existing "name" in the "nodes" array.
