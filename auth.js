var db;
var logger;

var bcrypt = require('bcrypt');

var PASSWORD_FIELD = 'superuser_password';

var init = function (dataBase, log) {
    db = dataBase;
    logger = log;
};

var checkPassword = function (password, cb) {

    db.query("select settings_value from temp_mon_schema.settings where settings_name=$1;", [PASSWORD_FIELD], function (err, res) {
        if (err) return cb(err);
        bcrypt.compare(password, res[0].settings_value, function (err, res) {
            if(res) return cb(null, {admin: true});
            else return cb(new Error("Wrong password"));
        });
    });
};

var superUserExists = function (cb) {
    db.query("select settings_id from temp_mon_schema.settings where settings_name=$1;", [PASSWORD_FIELD], function (err, res) {
        if (err) return cb(err);
        var superUserExists = false;
        if (res.length > 0) superUserExists = true;
        return cb (null, {superUserExists: superUserExists });
    });
};

var initSuperUser = function (password, cb) {
    bcrypt.hash(password, 10, function (err, hash) {
        if (err) return cb(err);
        db.query("insert into temp_mon_schema.settings (settings_name, settings_value) values ($1, $2);", [PASSWORD_FIELD, hash], function (err, res) {
            return cb(err);
        });
    });
};

var changeSuperUserPassword = function (data, cb) {
    bcrypt.hash(data.newPassword, 10, function (err, hash) {
        if (err) return cb(err);
        db.query("update temp_mon_schema.settings set settings_value = $2 where settings_name = $1;", [PASSWORD_FIELD, hash], function (err, res) {
            return cb(err);
        });
    });
};

module.exports = {
    init : init,
    checkPassword : checkPassword,
    superUserExists: superUserExists,
    initSuperUser: initSuperUser,
    changeSuperUserPassword: changeSuperUserPassword
};
