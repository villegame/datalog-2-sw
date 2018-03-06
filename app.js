var app = require('express')();
var http = require('http').Server(app);

var reader = require('./reader');
var db = require('./db');
var server = require('./server');
var sensors = require('./sensors');
var auth = require('./auth');
var logger = require('./logger');

// Init logger
logger.init();

// Init sensors
sensors.init(db, logger);

// Start reader
reader.start(http, sensors, logger);

// Start authentication service
auth.init(db, logger);

// Start web server
server.start(app, http, sensors, auth, logger);
