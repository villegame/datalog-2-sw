var exec = require('child_process').exec;
var async = require('async');

var readInterval  = 15000; // ms
var scriptTimeout = 5;	   // s

var start = function (http, sensors, logger) {
        io = require('socket.io')(http);

	setInterval(function () {

		var enabledSensors = [];
		var localSensors = [];

		async.series([
			function (done) {
				sensors.getEnabledSensors(function (err, results) {
					if (err) return done(err);
					enabledSensors = results;
					done();
				});
			},
			function (done) {
				sensors.getLocalSensors(function (err, results) {
					if (err) return done(err);
					localSensors = results;
					done();
				});
			}],
			function (err) {

				if (err) {
					logger.log({ msg: "Error getting, sensors.", err: err });
					return;
				}

				// timestamp in milliseconds
				var timestamp = Math.floor(Date.now());

				enabledSensors.forEach(function (eSensor) {
					
					// Check that sensor is connected (is present in local sensors)
					var isConnected = false;
					localSensors.forEach(function (lSensor) {
						if(eSensor.devices_source == lSensor.source) isConnected = true;
					});
					if(!isConnected) return;

					if(eSensor.devices_type == '1W-TEMP') {
						exec('timeout ' + scriptTimeout + ' python ' + __dirname + '/scripts/1w.py ' + eSensor.devices_source, function (err, stdout, stderr) {
							if (err) {
								logger.log({ msg: "Error reading 1W-TEMP sensor.", err: err });
								return;
							}
							try {
								var output = JSON.parse(stdout);
								io.emit('sensor-data', { 
									id: eSensor.devices_id, 
									sensor: eSensor.type, 
									temperature: output.temperature,
									time: timestamp
								});
								sensors.addValues({
									id: eSensor.devices_id, 
									temperature: output.temperature,
									humidity: null,
									pressure: null,
									time: timestamp
								}, function (err, res) {
									if (err) logger.log({ msg: "Error adding 1W-TEMP data.", err: err });
								});
							} catch (err) {
								logger.log({ msg: "Error parsing 1W-TEMP sensor data.", err: err });
							}
						});
					}
					
					if(eSensor.devices_type == 'BME-280') {
						exec('timeout ' + scriptTimeout + ' python ' + __dirname + '/scripts/bme280.py', function (err, stdout, stderr) {
							if (err) {
								logger.log({ msg: "Error reading BME-280 sensor.", err: err });
								return;
							}
							try {
								var output = JSON.parse(stdout);
                                                                io.emit('sensor-data', {
									id: eSensor.devices_id, 
                                                                        sensor: eSensor.type,
                                                                        temperature: output.temperature,
									pressure: output.pressure,
									humidity: output.humidity,
									time: timestamp
                                                                });
                                                                sensors.addValues({
                                                                        id: eSensor.devices_id,
                                                                        temperature: output.temperature,
                                                                        humidity: output.humidity,
                                                                        pressure: output.pressure, 
									time: timestamp
                                                                }, function (err, res) {
									if (err) logger.log({ msg: "Error adding BME-280 data.", err: err });
								});
							} catch (err) {
								logger.log({ msg: "Error parsing BME-280 sensor data.", err: err });
							}
						});
					}

				});
			}
		);

	}, readInterval);
};

module.exports = {
	start: start
};
