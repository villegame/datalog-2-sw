var async = require('async');
var exec = require('child_process').exec;
var db;
var logger;

var scriptTimeout = 5; // s

var init = function (dataBase, log) {
    db = dataBase;
    logger = log;
};

var runSystemOperation = function (data, cb) {
    switch(data.operation) {
        case "setDate":
            setDateTime(data.params, function (err) {
                return cb(err);
            });
            break;
        case "reboot":
            reboot(function (err) {
                return cb(err);
            });
            break;
        case "shutdown":
            shutdown(function (err) {
                return cb(err);
            });
            break;
    }
};

var setDateTime = function (time, cb) {
    exec('date +%s -s @' + time, function (err, stdout, stderr) {
        if(err) {
            logger.log({ msg: "Error syncing date time.", err: err });
        } else console.log("DATE SET");
        return cb(err);
    });
};

var reboot = function (cb) {
    exec('reboot', function (err, stdout, stderr) {
        if(err) {
            logger.log({ msg: "Error rebooting system.", err: err });
        } else console.log("REBOOTING");
        return cb(err);
    });
};

var shutdown = function (cb) {
    exec('shutdown -h now', function (err, stdout, stderr) {
        if(err) {
            logger.log({ msg: "Error shutting system down.", err: err });
        } else console.log("SHUTTING DOWN");
        return cb(err);
    });
};

module.exports = {
    init: init,
    runSystemOperation: runSystemOperation,
};
