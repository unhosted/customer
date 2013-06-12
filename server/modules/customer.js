var captcha = require('../captcha'),
  customer = require('../customer'),
  domain = require('../domain'),
  session = require('../session'),
  rs = require('../rs'),
  config = require('../config').config;

exports.requestCaptcha = function(cb) {
  captcha.get(cb);
};

function validEmail(str) {
  return typeof(str)=='string' && str.match(/^([a-z0-9\.\_\+\%\-]+@[a-z0-9\.\-]+\.[a-z]+)$/g);
                                               //  (chars)           @ (chars)      .(letters)
}

function validPassword(str) {
  return typeof(str)=='string' && str.length > 5;
  //any string of length >= 5
}

function validHost(str) {
  return typeof(str)=='string' && str.match(/^([a-z0-9][a-z0-9\-]*[a-z0-9])$/g);
                                             // (one lc) (lc or -)  (one lc)
}

exports.requestAccount = function(agree, email, pwd, captchaToken, captchaSolution, host, cb) {
  email = email.toLowerCase().trim();
  host = host.toLowerCase().trim();
  if(agree != 'Be nice!') {
    cb('please agree to be nice');
  } else if(!captcha.resolve(captchaToken, captchaSolution)) {
    cb('captcha wrong');
  } else if(!validEmail(email)) {
    cb('email not valid');
  } else if(!validPassword(pwd)) {
    cb('password not valid');
  } else if(!validHost(host)) {
    cb('host not valid');
  } else {
    customer.createAccount(email, pwd, function(err, uid) {
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
    	        session.create(uid, cb);
            });
        
          }
        });
      }
    });
  }
};

exports.getSession = function(email, pwd, cb) {
  console.log('getSession', email, pwd);
  customer.checkEmailPwd(email, pwd, function(err, result) {
    console.log(err, result);
    if(result) {
      session.create(result, cb);
    } else {
      cb(err);
    }
  });
};
exports.getSettings = function(sessionKey, cb) {
  session.getUid(sessionKey, function(err, uid) {
    if(err) {
      cb(err);
    } else {
      customer.getEmail(uid, cb);
    }
  });
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
