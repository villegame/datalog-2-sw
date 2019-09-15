var exec = require('child_process').exec;
var async = require('async');

var io;
var logger;

var readInterval  = 15000; // ms
var scriptTimeout = 5;     // s

// Reader for one-wire sensors
var readOneWire = function (sensors, eSensor, timestamp) {
    exec('timeout ' + scriptTimeout + ' python ' + __dirname + '/scripts/1w.py ' + eSensor.devices_source, function (err, stdout, stderr) {
        if (err) {
            logger.log({ msg: "Error reading 1W-TEMP sensor.", err: err });
            return;
        }
        var output;
        try {
            output = JSON.parse(stdout);
        } catch (err) {
            logger.log({ msg: "Error parsing 1W-TEMP sensor data.", err: err });
            return;
        }

        if(output.hasOwnProperty("err")) {
            if(output.err.type == 1) {
                // If got device not found message, disable device.
                sensors.updateSensor({
                    id: eSensor.devices_id,
                    name: eSensor.devices_name,
                    color: eSensor.devices_color,
                    temp_offset: eSensor.devices_temp_offset,
                    hum_offset: eSensor.devices_hum_offset,
                    pres_offset: eSensor.devices_pres_offset,
                    enabled: false
                }, function () {
                });
            }
            logger.log({ msg: "Exception reading 1W-TEMP sensor.", err: { msg: output.err.msg } });
            return;
        }

        io.emit('sensor-data', {
            id: eSensor.devices_id,
            sensor: eSensor.type,
            temperature: output.temperature + eSensor.devices_temp_offset,
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
    });
};

// Reader for bme sensor
var readBme = function (sensors, eSensor, timestamp) {
    exec('timeout ' + scriptTimeout + ' python ' + __dirname + '/scripts/bme280.py', function (err, stdout, stderr) {
        if (err) {
            logger.log({ msg: "Error reading BME-280 sensor.", err: err });
            return;
        }
        var output;
        try {
            output = JSON.parse(stdout);
        } catch (err) {
            logger.log({ msg: "Error parsing BME-280 sensor data.", err: err });
        }

        if(output.hasOwnProperty("err")) {
            if(output.err.type == 1) {
                // If got device not found message, disable device.
                sensors.updateSensor({
                    id: eSensor.devices_id,
                    name: eSensor.devices_name,
                    color: eSensor.devices_color,
                    temp_offset: eSensor.devices_temp_offset,
                    hum_offset: eSensor.devices_hum_offset,
                    pres_offset: eSensor.devices_pres_offset,
                    enabled: false
                }, function () {
                });
            }
            logger.log({ msg: "Exception reading BME-280 sensor.", err: { msg: output.err.msg } });
            return;
        }

        io.emit('sensor-data', {
            id: eSensor.devices_id,
            sensor: eSensor.type,
            temperature: output.temperature + eSensor.devices_temp_offset,
            pressure: output.pressure + eSensor.devices_pres_offset,
            humidity: output.humidity + eSensor.devices_hum_offset,
            time: timestamp
        });
        sensors.addValues({
            id: eSensor.devices_id,
            temperature: output.temperature,
            humidity: output.humidity,
            pressure: output.pressure,
            time: timestamp
        }, function (err, res) {
            if (err) {
                logger.log({ msg: "Error adding BME-280 data.", err: err });
            }
        });
    });

};

var start = function (http, sensors, log) {
    logger = log;
    io = require('socket.io')(http);

    setInterval(function () {

        var enabledSensors = [];
        var localSensors = [];

        async.series([
            function (done) {
                // Get list of enabled sensors in database
                sensors.getEnabledSensors(function (err, results) {
                    if (err) {
                        return done(err);
                    }
                    enabledSensors = results;
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

                    if(eSensor.devices_type == '1W-TEMP') {
                        readOneWire(sensors, eSensor, timestamp);
                    }
                    if(eSensor.devices_type == 'BME-280') {
                        readBme(sensors, eSensor, timestamp);
                    }

                });
            }
        );

    }, readInterval);
};

module.exports = {
    start: start
};
