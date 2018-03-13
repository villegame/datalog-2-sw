var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var async = require('async');
var methodOverride = require('method-override');

var isLogged = function (req) {
    if(!req.session || !req.session.admin) return false;
    return true;
};

var isAdmin = function (req, res, next) {
    if(!isLogged(req)) return res.status(401).send({ msg: "Not authenticated!" });
    next();
};

var start = function (app, http, sensors, auth, logger) {

    // index.html will be read from here, no need for app.get('/'...
    app.use(express.static(__dirname + '/public'));

    app.use(session({
        secret: 'basdla3RR3albabrllerelbkelk34jijtg3jng',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }
    }));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
        app.use(methodOverride());

    app.get('/login', function (req, res) {

        res.send({ logged: isLogged(req) });
    });

    app.post('/login', function (req, res) {

        auth.checkPassword(req.body.password, function (err, response) {
            if (!err && response.admin) {
                req.session.admin = true;
                return res.status(202).send();
            }
            return res.status(401).send({ msg: "Not authenticated!" });
        });
    });

    app.post('/logout', function (req, res) {

        req.session.destroy(function (err) {
            if (err) return res.status(500).send({ msg: "Error destroying session." });
            res.status(200).send({ msg: "Logged out." });
        });
    });

    app.get('/sensors', isAdmin, function (req, res, next) {

        sensors.getAllSensors(function (err, sensors) {
            if (err) return res.status(500).send({ msg: "Error getting sensors." });
            res.send(sensors);
        });
    });

    app.post('/sensors', isAdmin, function (req, res) {

        if ( typeof req.body.type !== 'string'
          || typeof req.body.name !== 'string'
          || typeof req.body.source !== 'string'
          || typeof req.body.color !== 'string') {
            return res.status(400).send({ msg: "Invalid input values." });
        }

        sensors.addSensor({
            type: req.body.type,
            name: req.body.name,
            source: req.body.source,
            color: req.body.color
        }, function (err) {
            if (err) return res.status(400).send(err);
            sensors.getAllSensors(function (err, sensors) {
                if (err) return res.status(500).send({ msg: "Error getting sensors." });
                res.send(sensors);
            });
        });
    });

    app.put('/sensors', isAdmin, function (req, res) {

        if ( typeof req.body.devices_id !== 'number'
          || typeof req.body.devices_type !== 'string'
          || typeof req.body.devices_name !== 'string'
          || typeof req.body.devices_source !== 'string'
          || typeof req.body.devices_color !== 'string'
          || typeof req.body.devices_enabled !== 'boolean') {
            return res.status(400).send("Invalid input values.");
        }

        sensors.updateSensor({
            id: req.body.devices_id,
            name: req.body.devices_name,
            color: req.body.devices_color,
            enabled: req.body.devices_enabled
        }, function (err) {
            if (err) return res.status(400).send(err);
            sensors.getAllSensors(function (err, sensors) {
                if (err) return res.status(500).send({ msg: "Error getting sensors." });
                res.send(sensors);
            });
        });

    });

    app.delete('/sensors/:devices_id', isAdmin, function (req, res) {

        if (typeof req.params.devices_id !== 'string') return res.status(400).send("Invalid input values.");

        sensors.deleteSensor({
            id: req.params.devices_id
        }, function (err) {
            if (err) return res.status(400).send(err);
            sensors.getAllSensors(function (err, sensors) {
                if (err) return res.status(500).send({ msg: "Error getting sensors." });
                res.send(sensors);
            });
        });
    });

    app.get('/values', function (req, res) {

        sensors.getValues(function (err, values) {
            if (err) return res.status(400).send(err);
            try {
                res.send(JSON.stringify(values));
            } catch (e) {
                return res.status(400).send(e);
            }
        });
    });

    http.listen(80, function () {
        console.log('listening port 80');
    });
}

module.exports = {
    start: start
};
