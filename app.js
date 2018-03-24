var app = require('express')();
var https = require('https'); //.Server(app);

var fs = require('fs');
var reader = require('./reader');
var db = require('./db');
var server = require('./server');
var sensors = require('./sensors');
var auth = require('./auth');
var logger = require('./logger');


var options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
    requestCert: false, 
    rejectUnauthorized: false
};
var httpsServer = https.createServer(options, app);

// Init logger
logger.init();

// Init sensors
sensors.init(db, logger);

// Start reader
reader.start(httpsServer, sensors, logger);

// Start authentication service
auth.init(db, logger);

// Start web server
server.start(app, httpsServer, sensors, auth, logger);
