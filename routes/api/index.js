var api = require('express').Router();


var topo = require('./topo.js');
var ahab = require('./ahab.js');
var rsvn = require('./reservation.js');



api.use('/', topo);
api.use('/', ahab);
api.use('/', rsvn)


module.exports = api;