var app = require('express')();
var http = require('http').Server(app);

var reader = require('./reader');
var db = require('./db');
var server = require('./server');
var sensors = require('./sensors');
var auth = require('./auth');

// Init sensors
sensors.init(db);

// Start reader
reader.start(http, sensors);

// Start authentication service
auth.init(db);

// Start web server
server.start(app, http, sensors, auth);
