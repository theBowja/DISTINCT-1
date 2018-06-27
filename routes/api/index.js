var api = require('express').Router();


var topo = require('topo.js');
var ahab = require('ahab.js');




api.use('/topo', topo);
api.use('/ahab', ahab);



module.exports = api;