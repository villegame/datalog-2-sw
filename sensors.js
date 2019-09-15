var async = require('async');
var exec = require('child_process').exec;
var db;
var logger;

var scriptTimeout = 5; // s

var init = function (dataBase, log) {
    db = dataBase;
    logger = log;
};

// Run scripts to list all connected sensors
var getLocalSensors = function (cb) {

    var sensors = [];
    var errors = [];

    async.series([
        function (done) {
            exec('timeout ' + scriptTimeout + ' python ' + __dirname + '/scripts/1w.py', function (err, stdout, stderr) {
                if (err) return done(err);
                var output;
                try {
                    output = JSON.parse(stdout); //
                } catch (e) {
                    return done(e);
                }
                if (output.hasOwnProperty('err')) {
                    errors.push("1W error: " + output.err.msg);
                } else {
                    output.sensors.forEach(function(sensor) {
                        sensors.push({type: "1W-TEMP", source: sensor});
                    });
		        }
                done();
            });
        },
        function (done) {
            exec('timeout ' + scriptTimeout + ' python ' + __dirname + '/scripts/bme280.py', function (err, stdout, stderr) {
                if (err) return done(err);
                var output;
                try {
                    output = JSON.parse(stdout);
                } catch (e) {
                    return done(e);
                }
                if (output.hasOwnProperty('err')) {
                    errors.push("BME-280 error: " + output.err.msg);
                } else {
                    sensors.push({type: "BME-280", source: "I2C"});
                }
                done();

            });
        }],
        function (err) {
            if (err) logger.log({ msg: "Error getting local sensors.", err: err });
            cb(err, { locals: sensors, errors: errors });
        }
    );
};

// Database functions:

var getSensorsFromDb = function (cb) {
    db.query("select devices_id, devices_type, devices_name, devices_source, devices_enabled, devices_color, devices_screen, devices_screen_order, devices_temp_offset, devices_hum_offset, devices_pres_offset from temp_mon_schema.devices order by devices_id;",
        [],
        function (err, data) {
            if(err) return cb(err);
            data.forEach(function (device, i, array) {
                array[i].devices_temp_offset = parseFloat(device.devices_temp_offset);
                array[i].devices_hum_offset = parseFloat(device.devices_hum_offset);
                array[i].devices_pres_offset = parseFloat(device.devices_pres_offset);
            });
            cb(err,data);
        }
    );
};

var addSensor = function (data, cb) {
    db.query("insert into temp_mon_schema.devices (devices_source, devices_name, devices_type, devices_color, devices_enabled) values ($1, $2, $3, $4, $5);", [data.source, data.name, data.type, data.color, true], cb);
};

var updateSensor = function (data, cb) {
    db.query("update temp_mon_schema.devices set devices_name=$1, devices_enabled=$2, devices_color=$3, devices_temp_offset=$4, devices_hum_offset=$5, devices_pres_offset=$6 where devices_id=$7;", [data.name, data.enabled, data.color, data.temp_offset, data.hum_offset, data.pres_offset, data.id], cb);
};

var clearSensor = function (data, cb) {
    db.query("delete from temp_mon_schema.values where devices_id=$1;", [data.id], cb);
};

var deleteSensor = function (data, cb) {
    db.query("delete from temp_mon_schema.devices where devices_id=$1;", [data.id], cb);
};

var getEnabledSensors = function (cb) {
    db.query("select devices_id, devices_name, devices_source, devices_type, devices_color, devices_temp_offset, devices_hum_offset, devices_pres_offset from temp_mon_schema.devices where devices_enabled=true order by devices_id;",
        [],
        function (err, data) {
            if(err) return cb(err);
            data.forEach(function (device, i, array) {
                array[i].devices_temp_offset = parseFloat(device.devices_temp_offset);
                array[i].devices_hum_offset = parseFloat(device.devices_hum_offset);
                array[i].devices_pres_offset = parseFloat(device.devices_pres_offset);
            });
            cb(err, data);
        }
    );
};

var addValues = function (data, cb) {
    db.query("insert into temp_mon_schema.values (devices_id, values_temperature, values_humidity, values_pressure, values_time) values ($1, $2, $3, $4, $5);", [data.id, data.temperature, data.humidity, data.pressure, data.time], cb);
};

var getLatestValues = function (cb) {
    var valueList = [];

    async.series([
        function (done) {
            getEnabledSensors(function (err, devices) {
                if (err) return done(err);
                devices.forEach(function (device) {
                    var newDevice = {
                        id: device.devices_id,
                        name: device.devices_name,
                        type: device.devices_type,
                        color: device.devices_color,
                        tempOffset: device.devices_temp_offset,
                        humOffset: device.devices_hum_offset,
                        presOffset: device.devices_pres_offset,
                    };
                    valueList.push(newDevice);
                });
                done();
            });
        },
        function (done) {
            async.mapSeries(valueList, function(data, callback) {
                db.query("select values_temperature, values_humidity, values_pressure, values_time from temp_mon_schema.values where devices_id = $1 order by values_time desc limit 1;", [data.id], function (err, values) {
                    if (err) return callback(err);
                    values.forEach(function(value) {
                        data['time'] = value.values_time;
                        if(data.type == '1W-TEMP') {
                            data['temperature'] = parseFloat(value.values_temperature) + data.tempOffset;
                        } else if (data.type == 'BME-280') {
                            data['temperature'] = parseFloat(value.values_temperature) + data.tempOffset;
                            data['humidity'] = parseFloat(value.values_humidity) + data.humOffset;
                            data['pressure'] = parseFloat(value.values_pressure) + data.presOffset;
                        }
                    });
                    return callback();
                });

            }, function (err) {
                return done(err);
            });

        }
    ], function (err) {
        cb (err, valueList);
    });
};

// Get values for live chart
var getValues = function (cb) {
    var valueList = [];
    var past = new Date() - (8 * 60 * 60 * 1000);

    async.series([
        function (done) {
            getEnabledSensors(function (err, devices) {
                if (err) return done(err);
                devices.forEach(function (device) {
                    var newDevice = {
                        id: device.devices_id,
                        name: device.devices_name,
                        type: device.devices_type,
                        color: device.devices_color,
                        tempOffset: device.devices_temp_offset,
                        humOffset: device.devices_hum_offset,
                        presOffset: device.devices_pres_offset,
                        time: []
                    };
                    if(newDevice.type == '1W-TEMP') {
                        newDevice['temperature'] = [];
                    } else if(newDevice.type == 'BME-280') {
                        newDevice['temperature'] = [];
                        newDevice['humidity'] = [];
                        newDevice['pressure'] = [];
                    }
                    valueList.push(newDevice);
                });
                done();
            });
        },
        function (done) {
            async.mapSeries(valueList, function(data, callback) {
                db.query("select values_temperature, values_humidity, values_pressure, values_time from temp_mon_schema.values where devices_id=$1 and values_time > $2 order by values_time limit 20000;", [data.id, past], function (err, values) {
                    if (err) return callback(err);
                    values.forEach(function(value) {
                        data['time'].push(value.values_time);
                        if(data.type == '1W-TEMP') {
                            data['temperature'].push(parseFloat(value.values_temperature) + data.tempOffset);
                        } else if (data.type == 'BME-280') {
                            data['temperature'].push(parseFloat(value.values_temperature) + data.tempOffset);
                            data['humidity'].push(parseFloat(value.values_humidity) + data.humOffset);
                            data['pressure'].push(parseFloat(value.values_pressure) + data.presOffset);
                        }
                    });
                    return callback();
                });

            }, function (err) {
                return done(err);
            });

        }
    ], function (err) {
        cb (err, valueList);
    });
};

// List all sensors (locally connected and from database) for configuration tool
var getAllSensors = function (cb) {
    var localSensors = [];
    var storedSensors = [];

    // Is not being sent forward...
    var localErrors = [];

    async.series([
        function (done) {
            getLocalSensors(function (err, res) {

                if (err) return done(err);
                localSensors = res.locals;
                localErrors = res.errors;
                done();
            });
        }, function (done) {
            getSensorsFromDb(function (err, res) {

                if (err) return done(err);
                storedSensors = res;
                done();
            });
        }], function (err) {

            if (err) return cb(err);

            var unregisteredSensors = [];
            var registeredSensors = [];
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
                if(isLocal) registeredSensors.push(sSensor);
                else removedSensors.push(sSensor);
            });

            return cb(null, {
                unregisteredSensors: unregisteredSensors,
                registeredSensors: registeredSensors,
                removedSensors: removedSensors
            });
        }
    );
};

module.exports = {
    init: init,
    addSensor: addSensor,
    clearSensor: clearSensor,
    updateSensor: updateSensor,
    deleteSensor: deleteSensor,
    getEnabledSensors: getEnabledSensors,
    addValues: addValues,
    getLatestValues: getLatestValues,
    getValues: getValues,
    getAllSensors: getAllSensors
};
