var captcha = require('../captcha'),
  customer = require('../customer'),
  domain = require('../domain'),
  rs = require('../rs'),
  config = require('../config').config;

exports.requestCaptcha = function(cb) {
  captcha.get(cb);
};

exports.requestAccount = function(agree, email, hash, captchaToken, captchaSolution, host, cb) {
  if(agree) {
    if(captcha.resolve(captchaToken, captchaSolution)) {
      customer.createAccount(email, hash, function(err, uid) {
        if(err) {
          cb(err);
        } else {
          var serverId = 0;
          rs.createRemotestorage(uid, serverId, host, 5000, function(err2) {
            if(err2) {
              cb(err2);
            } else {
              var root = config.serverRoot[serverId]+host+'/public/dns/whois/'+host+'.un.ht/';
              domain.createDomain(host, uid, root+'admin/', root+'tech/', root+'ns/', function(err3) {
                cb(err3, uid);
              });
            }
          });
        }
      });
    } else {
      cb('captcha wrong');
    }
  } else {
    cb('please agree to be nice');
  }
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
