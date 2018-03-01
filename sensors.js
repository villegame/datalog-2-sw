var async = require('async');
var exec = require('child_process').exec;
var db;

var init = function (dataBase) {
	db = dataBase;
};

var getLocalSensors = function (cb) {

        var sensors = [];

        async.series([
                function (done) {
                        exec('python ./scripts/1w.py', function (err, stdout, stderr) {
                                if (err) return done(err);
                                try {
                                        JSON.parse(stdout).sensors.forEach(function(sensor) {
                                                sensors.push({type: "1W-TEMP", source: sensor});
                                        });
                                        done();
                                } catch (e) {
                                        return done(e);
                                }
                        });
                },
                function (done) {
                        exec('python ./scripts/bme280.py', function (err, stdout, stderr) {
                                if (err) return done(err);
                                sensors.push({type: "BME-280", source: "I2C"});
                                done();
                        });
                }],
                function (err) {
                        if (err) console.error("Error getting local sensors", err);
                        cb(null, sensors);
                }
        );
};

getAllSensors = function (cb) {
        db.query("select devices_id, devices_type, devices_name, devices_source, devices_enabled, devices_color, devices_screen, devices_screen_order from temp_mon_schema.devices order by devices_id;", cb);
};

addSensor = function (data, cb) {
	db.query("insert into temp_mon_schema.devices (devices_source, devices_name, devices_type, devices_color, devices_enabled) values ('"+data.source+"', '"+data.name+"', '"+data.type+"', '"+data.color+"', true);", cb);
};

updateSensor = function (data, cb) {
        db.query("update temp_mon_schema.devices set devices_name='"+data.name+"', devices_enabled="+data.enabled+", devices_color='"+data.color+"' where devices_id="+data.id+";", cb);
};

deleteSensor = function (data, cb) {
        db.query("delete from temp_mon_schema.devices where devices_id="+data.id+";", cb);
};

getEnabledSensors = function (cb) {
        db.query("select devices_id, devices_name, devices_source, devices_type, devices_color from temp_mon_schema.devices where devices_enabled=true order by devices_id;", cb);
};

addValues = function (data, cb) {
	db.query("insert into temp_mon_schema.values (devices_id, values_temperature, values_humidity, values_pressure, values_time) values ("+data.id+", "+data.temperature+", "+data.humidity+", "+data.pressure+", "+data.time+");", cb);
};

getValues = function (cb) {
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
				db.query("select values_temperature, values_humidity, values_pressure, values_time from temp_mon_schema.values where devices_id="+data.id+" and values_time > "+past+" ;", function (err, values) {
					if (err) return callback(err);
					values.forEach(function(value) {
						data['time'].push(value.values_time);
						if(data.type == '1W-TEMP') {
							data['temperature'].push(value.values_temperature);
						} else if (data.type == 'BME-280') {
							data['temperature'].push(value.values_temperature);
							data['humidity'].push(value.values_humidity);
							data['pressure'].push(value.values_pressure);
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

module.exports = {
	init: init, 
	getLocalSensors: getLocalSensors,
	getAllSensors: getAllSensors,
	addSensor: addSensor, 
    	updateSensor: updateSensor,
        deleteSensor: deleteSensor,
        getEnabledSensors: getEnabledSensors,
	addValues: addValues,
	getValues: getValues
};
