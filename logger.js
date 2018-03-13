var bunyan = require('bunyan');
var logger;

var init = function () {
    logger = bunyan.createLogger({
        name: 'datalog-2-sw',
        streams: [{
            name: "logFileStream",
            path: __dirname + '/log/error.log'
        }, {
            name: "stderrStream",
            stream: process.stderr
        }]});
};

// Function for error messages only...
var log = function (message) {
    logger.error(message);
};

module.exports = {
    init: init,
    log: log
};
