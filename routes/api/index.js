var api = require('express').Router();


var topo = require('./topo.js');
var ahab = require('./ahab.js');
var rsvn = require('./reservation.js');
var reso = require('./resource.js');
var slic = require('./slice.js');



api.use('/', topo);
api.use('/', rsvn);
api.use('/', reso);	
api.use('/', slic);

api.use('/ahab', ahab);
// due to middleware in ahab.js, there should be no paths after this.

module.exports = api;