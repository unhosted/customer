var captcha = require('../captcha'),
  customer = require('../customer'),
  domain = require('../domain'),
  session = require('../session'),
  bearer = require('../bearer'),
  rs = require('../rs'),
  twitter = require('../twitter'),
  config = require('../config').config;

exports.requestCaptcha = function(cb) {
  if(typeof(cb) !== 'function') { throw new Error("Invalid callback!"); }
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
  if(typeof(cb) !== 'function') { throw new Error("Invalid callback!"); }
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
              if(err3) {
                cb(err3);
              } else {
    	          session.create(uid, cb);
              }
            });
          }
        });
      }
    });
  }
};

exports.disobey = function(twitterKeys, cb) {
  twitter.retrieve(twitterKeys, function(err, handle) {
    customer.createAccount('twitter:'+handle, null, function(err, uid) {
      if(err) {
        cb(err);
      } else {
        var serverId = 0;
        rs.createRemotestorage(uid, serverId, handle, 5000, function(err2) {
          if(err2) {
            cb(err2);
          } else {
            var root = config.serverRoot[serverId]+handle+'/public/dns/whois/'+handle+'.un.ht/';
            domain.createDomain(handle, uid, root+'admin/', root+'tech/', root+'ns/', function(err3) {
              if(err3) {
                cb(err3);
              } else {
                session.create(uid, cb);
              }
            });
          }
        });
      }
    });
  });
};
    
exports.getSession = function(email, pwd, cb) {
  if(typeof(cb) !== 'function') { throw new Error("Invalid callback!"); }
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
  if(typeof(cb) !== 'function') { throw new Error("Invalid callback!"); }
  session.getUid(sessionKey, function(err, uid) {
    if(err) {
      cb(err);
    } else {
      customer.getEmail(uid, cb);
    }
  });
};

exports.startForgotPassword = function(email, captchaToken, captchaSolution, cb) {
  if(typeof(cb) !== 'function') { throw new Error("Invalid callback!"); }
  if(captcha.resolve(captchaToken, captchaSolution)) {
    customer.startForgotPassword(email, cb);
  } else {
    cb('captcha wrong!');
  }
};

function checkSP(sessionKey, password, cb) {
  if(typeof(cb) !== 'function') { throw new Error("Invalid callback!"); }
  if(typeof(sessionKey) != 'string' || !sessionKey.length) {
    cb('no session key supplied');
  } else if(typeof(password) != 'string' || !password.length) {
    cb('no password supplied');
  } else {
    session.getUid(sessionKey, function(err, uid) {
      if(err) {
        cb(err);
      } else {
        console.log('uid for sessionKey ', sessionKey, uid);
        customer.checkUidPwd(uid, password, cb);
      }    
    });
  }
}
exports.startChangeEmail = function(sessionKey, password, newEmail, cb) {
  checkSP(sessionKey, password, function(err, uid) {
    if(err) {
      cb(err);
    } else {
      customer.startChangeEmail(uid, newEmail, cb);
    }
  });
};
exports.completeChangeEmail = function(tokenUid, cb) {
  customer.checkTokenUid(tokenUid, function(err, uid) {
    if(err) {
      cb(err);
    } else {
      customer.completeChangeEmail(uid, function(err) {
        if(err) {
          cb(err);
        } else {
          session.create(uid,cb);
        }
      });
    }
  });
};
exports.completeVerifyEmail = function(tokenUid, cb) {
  if(typeof(cb) !== 'function') { throw new Error("Invalid callback!"); }
  customer.completeVerifyEmail(tokenUid, function(err, uid) {
    console.log('email verified', err, uid);
    if(err) {
      cb(err);
    } else {
    	session.create(uid, cb);
    }
  });
};
exports.completeForgotPassword = function(tokenUid, newPassword, cb) {
  if(typeof(cb) !== 'function') { throw new Error("Invalid callback!"); }
  console.log(tokenUid, newPassword, typeof(cb));
  customer.checkTokenUid(tokenUid, function(err, uid) {
    if(err) {
      cb(err);
    } else {
      customer.changePassword(uid, newPassword, function(err) {
        if(err) {
          cb(err);
        } else {
          session.create(uid, cb);
        }
      });
    }
  });
}
exports.changePassword = function(sessionKey, password, newPassword, cb) {
  if(typeof(cb) !== 'function') { throw new Error("Invalid callback!"); }
  console.log('changePassword', sessionKey, password, newPassword, typeof(cb));
  checkSP(sessionKey, password, function(err, uid) {
    if(err) {
      cb(err);
    } else {
      customer.changePassword(uid, newPassword, cb);
    }
  });
};

exports.deleteAccount = function(sessionKey, password, cb) {
  if(typeof(cb) !== 'function') { throw new Error("Invalid callback!"); }
  checkSP(sessionKey, password, function(err, uid) {
    if(err) {
      cb(err);
    } else {
      customer.deleteAccount(uid, cb);
    }
  });
};

exports.getBearerToken = function(sessionKey, origin, scope, cb) {
  if(typeof(cb) !== 'function') { throw new Error("Invalid callback!"); }
  session.getUid(sessionKey, function(err, uid) {
    if(err) {
      cb(err);
    } else {
      bearer.get(uid, origin, scope, cb);
    }
  });
}

exports.revokeBearerToken = function(sessionKey, origin, token, cb) {
  if(typeof(cb) !== 'function') { throw new Error("Invalid callback!"); }
  session.getUid(sessionKey, function(err, uid) {
    if(err) {
      cb(err);
    } else {
      bearer.revoke(uid, origin, token, cb);
    }
  });
}

exports.listBearerTokens = function(sessionKey, cb) {
  if(typeof(cb) !== 'function') { throw new Error("Invalid callback!"); }
  session.getUid(sessionKey, function(err, uid) {
    if(err) {
      cb(err);
    } else {
      bearer.list(uid, cb);
    }
  });
}
