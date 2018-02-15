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
        db.query("select devices_id, devices_type, devices_name, devices_source, devices_enabled, devices_screen, devices_screen_order from temp_mon_schema.devices;", cb);
};

addSensor = function (data, cb) {
	db.query("insert into temp_mon_schema.devices (devices_source, devices_name, devices_type, devices_enabled) values ('"+data.source+"', '"+data.name+"', '"+data.type+"', true);", cb);
};

updateSensor = function (data, cb) {
        db.query("update temp_mon_schema.devices set devices_name='"+data.name+"', devices_enabled="+data.enabled+" where devices_id="+data.id+";", cb);
};

deleteSensor = function (data, cb) {
        db.query("delete from temp_mon_schema.devices where devices_id="+data.id+";", cb);
};

getEnabledSensors = function (cb) {
        db.query("select devices_id, devices_source, devices_type from temp_mon_schema.devices where devices_enabled=true;", cb);
};

addValues = function (data, cb) {
	db.query("insert into temp_mon_schema.values (devices_id, values_temperature, values_humidity, values_pressure) values ("+data.id+", "+data.temperature+", "+data.humidity+", "+data.pressure+");", cb);
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
};
