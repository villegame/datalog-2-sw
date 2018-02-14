var pg = require('pg');
var async = require('async');

var pool = null;

init = function () {
	pool = new pg.Pool({
		user: 'temp_mon_user', 
		host: 'localhost', 
		database: 'temp_mon',
		password: 'temp_mon_password',
		port: 5432
	});
}

query = function (query, cb) {
	if (!pool) init();
	pool.connect(function (err, client, release) {
		if (err) return cb(err);
		client.query(query, function (err, result) {
			release();
			if (err) {
				console.error(err);
				return cb(err);
			}
			return cb(null, result.rows);
		});
	});
};

getSensors = function (cb) {

	
	query("select devices_id, devices_type, devices_name, devices_source, devices_enabled, devices_screen, devices_screen_order from temp_mon_schema.devices where devices_type = '1W-TEMP';"
	, function (err, result) {
		return cb(err, result);
	});

/*
	if (!pool) init();
	pool.connect(function (err, client, release) {
		if (err) return cb(err);
		client.query("select devices_id, devices_type, devices_name, devices_source, devices_sensor, devices_enabled, devices_screen, devices_screen_order from temp_mon_schema.devices where devices_sensor=1;", function (err, result) {
			release();
			if (err) return cb(err);
			return cb(null, result.rows);
		});
	});
*/
};

addSensor = function (data, cb) {
	query("insert into temp_mon_schema.devices (devices_source, devices_name, devices_type, devices_enabled) values ('"+data.source+"', '"+data.name+"', '"+data.type+"', 1)", function (err, result) {
		return cb(err, result);
	});
};

module.exports = {
	query: query,
	getSensors: getSensors,
	addSensor: addSensor
};
