var express = require('express');

start = function (app, http) {
	app.set('views', './views');
	app.set('view engine', 'pug');

	app.use('/', express.static('public'));

	app.get('/', function (req, res) {
	        res.render('index');
	});

	http.listen(8888, function () {
	        console.log('listening port 8888');
	});
}

module.exports = {
	start: start
};
