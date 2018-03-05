var db;

var init = function (dataBase) {
        db = dataBase;
};

// TODO: A real password crypting etc
var checkPassword = function (password, cb) {
	if (password == 'terveterve') return cb(null, {admin: true});
	else return cb (new Error("Wrong password"));
};

module.exports = {
	init : init,
	checkPassword : checkPassword
};
