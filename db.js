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

query = function (query, values, cb) {
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
