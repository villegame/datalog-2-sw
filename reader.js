var exec = require('child_process').exec;
var db;
var io;


var readInterval = 3000;

/*
init = function (database, http) {
	if(!database) return console.error("Reader init error: Provided invalid database.");
	if(!http) return console.error("Reader init error: Provided invalid http server.");
	db = database;
	io = require('socket.io')(http);
};*/

start = function (database, http) {

	if(!database) return console.error("Reader init error: Provided invalid database.");
        if(!http) return console.error("Reader init error: Provided invalid http server.");
        db = database;
        io = require('socket.io')(http);

	setInterval(function () {

		exec('python ./scripts/bme280.py', function (err, stdout, stderr) {
			if (err)    console.log("error: ", err);
			if (stdout) {
				try {
					var output = JSON.parse(stdout);
					console.log("bme temp: ", output.temperature, "typeof ", typeof output.temperature);
					console.log("bme hum : ", output.humidity, "typeof ", typeof output.humidity);
					console.log("bme pres: ", output.pressure, "typeof ", typeof output.pressure);

					io.emit('sensor-data', {sensor: 'bme', temp: output.temperature, hum: output.humidity, pres: output.pressure});

				} catch (err) {
					console.log("Error parsing bme280 sensor data... ", err);
				}
			}
			if (stderr) console.log("serr: ", stderr);
		});
		exec('python ./scripts/1w.py 28-800000289ce1', function (err, stdout, stderr) {
			if (err)    console.log("error: ", err);
			if (stdout) {
				try {
					var output = JSON.parse(stdout);
					console.log("1w temp: ", output.temperature, "type of ", typeof output.temperature);

					io.emit('sensor-data', {sensor: '1w', temp: output.temperature});
				} catch (err) {
					console.log("Error parsing 1w sensor data... ", err);
				}
			}
			if (stderr) console.log("serr: ", stderr);
		});


		db.query("SELECT NOW()", function (err, res) {
			if (err) return console.error("Error executing query", err);
			console.log("RESULTS: ", res);			
		});
		
		// 
		// io.emit('sensor-data', {
		// 	sensors : [{
		// 		sensorId: id, 
		// 		value: value
		// 	}]
		// } );

	}, readInterval);
};

module.exports = {
	start: start
};
