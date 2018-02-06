var exec = require('child_process').exec;

setInterval(function () {
	exec('python ./scripts/bme280.py', function (err, stdout, stderr) {
		if (err)    console.log("error: ", err);
		if (stdout) {
			try {
				var output = JSON.parse(stdout);
				console.log("bme temp: ", output.temperature, "typeof ", typeof output.temperature);
				console.log("bme hum : ", output.humidity, "typeof ", typeof output.humidity);
				console.log("bme pres: ", output.pressure, "typeof ", typeof output.pressure);
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
			} catch (err) {
				console.log("Error parsing 1w sensor data... ", err);
			}
		}
		if (stderr) console.log("serr: ", stderr);
	});
}, 3000);
