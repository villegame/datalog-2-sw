var app = require('express')();
var http = require('http').Server(app);

var reader = require('./reader');
var db = require('./db');
var server = require('./server');

// Start reader
reader.start(db, http);

// Start web server
server.start(app, http, db);
