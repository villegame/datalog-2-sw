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

var superUserExists = function (cb) {
    db.query("select settings_id from temp_mon_schema.settings where settings_name=$1;", ['superuser_password'], function (err, res) {
        if (err) return cb(err);
        var superUserExists = false;
        if (res.length > 0) superUserExists = true;
        return cb (null, {superUserExists: superUserExists });
    });
};

module.exports = {
    init : init,
    checkPassword : checkPassword,
    superUserExists: superUserExists,
};
