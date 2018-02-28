var express = require('express');
var bodyParser = require('body-parser');
var async = require('async');
var methodOverride = require('method-override');

start = function (app, http, sensors) {
	app.set('views', './views');
	app.set('view engine', 'pug');

	app.use('/', express.static('public'));

	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
        app.use(methodOverride('_method'));

	app.get('/', function (req, res) {
	        res.render('index');
	});

	app.get('/config', function (req, res) {

		var localSensors = [];
		var storedSensors = [];

		async.parallel([
			function (done) {
				sensors.getLocalSensors(function (err, res) {
					if (err) return done(err);
					localSensors = res;
					done();
				});
			}, function (done) {
				sensors.getAllSensors(function (err, sensors) {
					if (err) return done(err);
					storedSensors = sensors;
					done();
				});
			}], function (err) {
				if (err) {
					console.error("Error getting sensors", err);
					return res.status(500).send("Error getting sensors.");
				}

				var unregisteredSensors = [];
              			var removedSensors = [];

				localSensors.forEach(function (lSensor) {
					var inDatabase = false;
					storedSensors.forEach(function (sSensor) {
						if (lSensor.type == "1W-TEMP" && sSensor.devices_type == "1W-TEMP" && lSensor.source == sSensor.devices_source) inDatabase = true;
						if (lSensor.type == "BME-280" && sSensor.devices_type == "BME-280") inDatabase = true;
					});
					if (!inDatabase) unregisteredSensors.push(lSensor);
				});


				storedSensors.forEach(function (sSensor, i, array) {
					var isLocal = false;
					localSensors.forEach(function (lSensor) {
						if (sSensor.devices_type == "1W-TEMP" && sSensor.devices_source == lSensor.source) isLocal = true;
						if (sSensor.devices_type == "BME-280" && lSensor.type == "BME-280") isLocal = true;
					});
					array[i].connected = isLocal;
				});

				res.render('config', {
					unregisteredSensors: unregisteredSensors, 
					registeredSensors: storedSensors,
				});
			}
		);
	});

	app.post('/config/register-sensor', function (req, res) {

		if ( typeof req.body.type !== 'string'
		  || typeof req.body.name !== 'string'
		  || typeof req.body.source !== 'string') {
			return res.status(400).send("Invalid input values.");
		}

		sensors.addSensor({
			type: req.body.type,
			name: req.body.name, 
			source: req.body.source
		}, function (err) {
			if (err) return res.status(400).send(err);
			//res.status(201).send({msg:'ok'});
			res.redirect('/config');

		}); 
	});

	app.post('/config/update-sensor', function (req, res) {

		if ( typeof req.body.id !== 'string'
 		  || typeof req.body.type !== 'string'
		  || typeof req.body.name !== 'string'
                  || typeof req.body.source !== 'string') {
			return res.status(400).send("Invalid input values.");
		}

		sensors.updateSensor({
			id: req.body.id,
			name: req.body.name,
                        enabled: req.body.enabled ? true : false
		}, function (err) {
			if (err) return res.status(400).send(err);
			//res.status(201).send({msg:'ok'});
			res.redirect('/config');

		});

		
	});

	app.delete('/config/delete-sensor', function (req, res) {
		
		if (typeof req.body.id !== 'string') return res.status(400).send("Invalid input values.");

		sensors.deleteSensor({
			id: req.body.id
		}, function (err) {
			if (err) return res.status(400).send(err);
			//res.send({msg: 'ok'});
			res.redirect('/config');
		});
	});

	app.get('/archives', function (req, res) {
		res.render('archives');
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
