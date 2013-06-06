var captcha = require('../captcha');

exports.requestCaptcha = function(cb) {
  captcha.get(cb);
};

exports.requestAccount = function(email, hash, captchaToken, captchaSolution, cb) {
  cb(captcha.resolve(captchaToken, captchaSolution));
};

exports.getSession = function(email, hash, cb) {
};

exports.resetPassword = function(email, captcha, cb) {
};

exports.changeEmail = function(uid, hash, newEmail, cb) {
};

exports.changePwd = function(uid, hash, newHash, cb) {
};

exports.deleteAccount = function(uid, hash, cb) {
};

exports.addThing = function(uid, hash, type, params, cb) {
};

exports.updateThing = function(uid, hash, thingId, newParams, cb) {
};

exports.deleteThing = function(uid, hash, thingId, cb) {
};

exports.listThings = function(uid, sessionToken, cb) {
};

exports.listUsage = function(uid, sessionToken, cb) {
};

exports.listDonations = function(uid, sessionToken, cb) {
};

exports.customerDetails = function(uid, sessionToken, cb) {
};
