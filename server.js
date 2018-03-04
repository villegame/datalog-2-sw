var express = require('express');
var bodyParser = require('body-parser');
var async = require('async');
var methodOverride = require('method-override');

start = function (app, http, sensors) {

	app.use('/', express.static('public'));

	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
        app.use(methodOverride());

	app.get('/', function (req, res) {
		res.sendFile(__dirname + '/public/index.html');
	});

	app.get('/config', function (req, res) {
		sensors.getAllSensors(function (err, sensors) {
			if (err) return res.status(500).send("Error getting sensors.");
			res.send(sensors);
		});
	});

	app.post('/config/register-sensor', function (req, res) {

		if ( typeof req.body.type !== 'string'
		  || typeof req.body.name !== 'string'
		  || typeof req.body.source !== 'string'
                  || typeof req.body.color !== 'string') {
			return res.status(400).send("Invalid input values.");
		}

		sensors.addSensor({
			type: req.body.type,
			name: req.body.name, 
			source: req.body.source, 
                        color: req.body.color
		}, function (err) {
			if (err) return res.status(400).send(err);
			//res.status(201).send({msg:'ok'});
			res.send({msg: 'ok'})
			//res.redirect('/config');

		}); 
	});

	app.post('/config/update-sensor', function (req, res) {

		if ( typeof req.body.id !== 'string'
 		  || typeof req.body.type !== 'string'
		  || typeof req.body.name !== 'string'
                  || typeof req.body.source !== 'string'
                  || typeof req.body.color !== 'string') {
			return res.status(400).send("Invalid input values.");
		}

		sensors.updateSensor({
			id: req.body.id,
			name: req.body.name,
                        color: req.body.color,
                        enabled: req.body.enabled ? true : false
		}, function (err) {
			if (err) return res.status(400).send(err);
			res.send({msg:'ok'});
			//res.redirect('/config');

		});

		
	});

	app.delete('/config/delete-sensor', function (req, res) {
		
		if (typeof req.body.id !== 'string') return res.status(400).send("Invalid input values.");

		sensors.deleteSensor({
			id: req.body.id
		}, function (err) {
			if (err) return res.status(400).send(err);
			res.send({msg: 'ok'});
			//res.redirect('/config');
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

	http.listen(8888, function () {
	        console.log('listening port 8888');
	});
}

module.exports = {
	start: start
};
