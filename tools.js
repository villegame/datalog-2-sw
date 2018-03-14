var async = require('async');
var exec = require('child_process').exec;
var db;
var logger;

var scriptTimeout = 5; // s

var init = function (dataBase, log) {
    db = dataBase;
    logger = log;
};

var setDateTime = function (data, cb) {
    exec('date +%s -s @' + data.time, function (err, stdout, stderr) {
        if(err) logger.log({ msg: "Error syncing date time.", err: err });
    });
};

module.exports = {
    init: init,
    setDateTime: setDateTime,
};
