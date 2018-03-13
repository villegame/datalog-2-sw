var db;
var logger;

var init = function (dataBase, log) {
    db = dataBase;
    logger = log;
};

// TODO: A real password crypting etc
var checkPassword = function (password, cb) {
    if (password == 'password') return cb(null, {admin: true});
    else return cb (new Error("Wrong password"));
};

module.exports = {
    init : init,
    checkPassword : checkPassword
};
