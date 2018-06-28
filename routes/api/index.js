var api = require('express').Router();


var topo = require('./topo.js');
var ahab = require('./ahab.js');




api.use('/', topo);
api.use('/', ahab);



module.exports = api;