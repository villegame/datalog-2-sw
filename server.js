var express = require('express');
var bodyParser = require('body-parser');
var async = require('async');
var exec = require('child_process').exec;

// This goes somewhere else?
var getLocalSensors = function (cb) {
        exec('python ./scripts/1w.py', function (err, stdout, stderr) {
                if (err) return cb(err);
                if (stderr) return cb(stderr);
                try {
                        cb(null,JSON.parse(stdout));
                } catch (e) {
                        return cb(e);
                }
        });
};


start = function (app, http, db) {
	app.set('views', './views');
	app.set('view engine', 'pug');

	app.use('/', express.static('public'));

	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));

	app.get('/', function (req, res) {
	        res.render('index');
	});

	app.get('/config', function (req, res) {

		var localSensors = [];
		var storedSensors = [];

		async.parallel([
			function (done) {
				getLocalSensors(function (err, sensors) {
					if (err) return done(err);
					localSensors = sensors.sensors;
					done();
				});
			}, function (done) {
				db.getSensors(function (err, sensors) {
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
						if (lSensor == sSensor.devices_source) inDatabase = true;
					});
					if (!inDatabase) unregisteredSensors.push(lSensor);
				});


				storedSensors.forEach(function (sSensor, i, array) {
					var isLocal = false;
					localSensors.forEach(function (lSensor) {
						if (sSensor.devices_source == lSensor) isLocal = true;
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

		console.log("type ", req.body.type, " ", typeof req.body.type);
		console.log("name ", req.body.name, " ", typeof req.body.name);
		console.log("source ", req.body.source, " ", typeof req.body.source);

		if ( typeof req.body.type !== 'string'
		  || typeof req.body.name !== 'string'
		  || (req.body.type === '1W-TEMP' && typeof req.body.source !== 'string')) {
			return res.status(400).send("Invalid input values.");
		}
		db.addSensor({
			type : req.body.type,
			name : req.body.name, 
			source: req.body.source
		}, function (err) {
			if (err) return res.status(400).send(err);
			res.status(201).send({msg:'ok'});
		}); 
	});

	app.get('/archives', function (req, res) {
		res.render('archives');
	});

	http.listen(8888, function () {
	        console.log('listening port 8888');
	});
}

module.exports = {
	start: start
};
