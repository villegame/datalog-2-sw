var exec = require('child_process').exec;
var async = require('async');

var readInterval = 3000;

start = function (http, sensors) {

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

				if (err) return console.error("Error getting sensors", err);

				enabledSensors.forEach(function (eSensor) {
					
					// Check that sensor is connected (is present in local sensors)
					var isConnected = false;
					localSensors.forEach(function (lSensor) {
						if(eSensor.devices_source == lSensor.source) isConnected = true;
					});
					if(!isConnected) return;

					if(eSensor.devices_type == '1W-TEMP') {
						exec('python ./scripts/1w.py ' + eSensor.devices_source, function (err, stdout, stderr) {
							if (err) return console.error("Error reading 1W-TEMP sensor", err);
							try {
								var output = JSON.parse(stdout);
								io.emit('sensor-data', { 
									sensor: eSensor.type, 
									temperature: output.temperature
								});
								sensors.addValues({
									id: eSensor.devices_id, 
									temperature: output.temperature,
									humidity: null,
									pressure: null
								}, function (err, res) {
									if (err) console.error("ERROR ADDING 1W-TEMP DATA", err);
								});
							} catch (err) {
								console.error("Error parsing 1W-TEMP sensor data", err);
							}
						});
					}
					
					if(eSensor.devices_type == 'BME-280') {
						exec('python ./scripts/bme280.py', function (err, stdout, stderr) {
							if (err) return console.error("Error reading BME-280 sensor", err);
							try {
								var output = JSON.parse(stdout);
                                                                io.emit('sensor-data', {
                                                                        sensor: eSensor.type,
                                                                        temperature: output.temperature,
									pressure: output.pressure,
									humidity: output.humidity
                                                                });
                                                                sensors.addValues({
                                                                        id: eSensor.devices_id,
                                                                        temperature: output.temperature,
                                                                        humidity: output.humidity,
                                                                        pressure: output.pressure
                                                                }, function (err, res) {
									if (err) console.error("ERROR ADDING BME-280 DATA", err);
								});
							} catch (err) {
								console.error("Error parsing BME-280 sensor data", err);
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
