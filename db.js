var pg = require('pg');
var async = require('async');

var pool = null;

// TODO: these can be put in some other file containing credentials?
var init = function () {
	pool = new pg.Pool({
		user: 'temp_mon_user', 
		host: 'localhost', 
		database: 'temp_mon',
		password: 'temp_mon_password',
		port: 5432
	});
}

var query = function (query, values, cb) {
	if (!pool) init();
	pool.connect(function (err, client, release) {
		if (err) return cb(err);
		client.query(query, values, function (err, result) {
			release();
			if (err) {
				console.error(err);
				return cb(err);
			}
			return cb(null, result.rows);
		});
	});
};

module.exports = {
	query: query
};
