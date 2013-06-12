var mysql = require('mysql'),
  Memcache = require('memcache'),
  email = require('./email').email,
  uuid = require('node-uuid'),
  crypto = require('crypto'),
  config = require('./config').config;

var connection = mysql.createConnection({
  host     : config.db.host,
  user     : config.db.user,
  password : config.db.password,
  database : config.db.database
});

connection.connect();

var memcache = new Memcache.Client(config.memcache.port, config.memcache.host);
memcache.connect();

connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
  if (err) throw err;

  console.log('The solution is: ', rows[0].solution);
});

//connection.end();

//customers:
// uid (int), email_address (str), new_email_address (str), password_hash (str), status (int), token (str)
//
//domains:
//uid (int), host (str), admin (url), tech (url), ns (url)
//
//rs:
//uid (int), server (str), username (str), quota (int)

var USER = {
  FRESH: 0,
  MINVERIFIED: 1, //all states up from here are 'verified', the ones below will show a prompt to verify your email address
  VERIFIED: 1,
  CHANGING: 2,
  RESETTING: 3,
  MAXOPEN: 3,//all states up to here are 'open', the ones below will not allow logging in
  SUSPENDED: 4,
  CLOSED: 5
};

function genToken() {
  return uuid();
}

exports.getEmail = function(uid, cb) {
  console.log('looking up email for uid', uid);
  connection.query('SELECT `email_address`, `status` FROM `customers` WHERE `uid` = ? AND `status` <= ?',
      [uid, USER.MAXOPEN], function(err, rows) {
    if(err) {
      cb(err);
    } else if(rows.length != 1) {
      cb('invalid user');
    } else {
      cb(null, {
        email: rows[0].email_address,
        emailValidated: (rows[0].status>=USER.MINVERIFIED)
      });
    }
  });
}

exports.createAccount = function(emailAddress, password, cb) {
  var token = genToken();
  var passwordSalt = uuid();
  var passwordHash = crypto.createHash('sha256').update(password).update(passwordSalt).digest('hex');
  connection.query('INSERT INTO `customers` (`email_address`, `password_hash`, `password_salt`, `token`, `status`) VALUES (?, ?, ?, ?, ?)', [emailAddress, passwordHash, passwordSalt, token, USER.FRESH], function(err, data) {
    if(err) {
      cb(err);
    } else {
      var uid = data.insertId;
      email.verify(emailAddress, token+'_'+uid, function(err2) {
        cb(err2, uid);
      });
    }
  });
};
exports.verifyEmail = function(tokenUid, cb) {
  var parts = tokenUid.split('_');
  connection.query('UPDATE `customers` SET `status`= ?'
      +' WHERE `status` = ? AND `token` = ? AND `uid` = ?',
      [USER.VERIFIED, USER.FRESH, parts[0], parts[1]], function(err) {
    cb(err, parts[1]);
  });
};
exports.startResetPassword = function(emailAddress, cb) {
  cb(null, 'maybe');//we don't tell the client if the attempt was successful, and send this immediately to avoid timing attacks
  var token = genToken();
  connection.query('SELECT `uid` FROM `customers`'
      +' WHERE `email_address` = ?', [emailAddress], function(err, rows) {
    if(err) {
      console.log('err', err);
    } else if(rows.length!=1) {
      console.log('rows.length', rows.length);
    } else {
      connection.query('UPDATE `customers` SET `status` = ?, `token` = ?'
          +' WHERE `uid` = ?', [USER.RESETTING, token, rows[0].uid], function(err2) {
        if(err2) {
          console.log('err2', err2);
        } else {
          email.resetPassword(emailAddress, token+'_'+rows[0].uid, function(err3) {
            if(err3) {
              console.log('err3', err3);
            }
          });
        }
      });
    }
  });
};
exports.startEmailChange = function(uid, newEmail, cb) {
  var token = genToken();
  console.log(USER.CHANGING, newEmail, uid, token);
  connection.query('UPDATE `customers` SET `status` = ?, `new_email_address` = ?, `token` = ? WHERE `uid` = ?',
      [USER.CHANGING, newEmail, token, uid], function(err1, data) {
    connection.query('SELECT `email_address` from `customers` WHERE uid = ?', [uid], function(err2, currentEmail) {
      email.changeTo(newEmail, token+'_'+uid, function(err3) {
        email.changeFrom(currentEmail[0].email_address, cb);
      });
    });
  });
};
exports.completeEmailChange = function(uid, cb) {
  var token = genToken();
  connection.query('UPDATE `customers` SET `status` = ?, `email_address` = `new_email_address`, `token` = NULL,'
      +'`new_email_address` = NULL WHERE `uid` = ?', [USER.VERIFIED, uid], cb);
};
exports.checkTokenUid = function(tokenUid, cb) {
  var parts = tokenUid.split('_');
  connection.query('SELECT `uid` FROM `customers` WHERE `uid` = ? AND `token` = ?', [parts[1], parts[0]], function(err, rows) {
    if(err) {
      cb(err);
    } else if(!rows.length) {
      cb('token not found '+parts[0]);
    } else {
      cb(null, rows[0].uid);
    }
  });
};
exports.changePassword = function(uid, newPassword, cb) {
  var passwordSalt = uuid();
  var passwordHash = crypto.createHash('sha256').update(newPassword).update(passwordSalt).digest('hex');
  connection.query('UPDATE `customers` SET `password_hash` = ?, `password_salt` = ?'
      +' WHERE `uid` = ?', [passwordHash, passwordSalt, uid], function(err, result) {
    memcache.delete('pwd-u:'+uid);
    exports.getEmail(uid, function(err, data) {
      if(err) {
        console.log(err);
      } else {
        memcache.delete('pwd:'+data.email);
      }
      cb();
    });
  });
};
exports.checkUidPwd = function(uid, password, cb) {
  memcache.get('pwd-u:'+uid, function(err, valStr) {
    var val;
    try {
      val = JSON.parse(valStr);
    } catch(e) {
    }
    console.log('memcache', err, val);
    if(val) {
      var hash = crypto.createHash('sha256').update(password).update(val.passwordSalt).digest('hex');
      if(val.passwordHash == hash) {        
        cb(null, uid);
      } else {
        cb('wrong email/pwd (cached)');
      }
    } else {
      connection.query('SELECT `status`, `password_hash`, `password_salt` FROM `customers`'
          +' WHERE `uid` = ?',
          [uid], function(err, rows) {
        console.log(err, rows);
        if(err) {
          cb('internal database error');
        } else {
          if(rows.length>=1 && rows[0].status<=USER.MAXOPEN) {
            memcache.set('pwd-u:'+uid, JSON.stringify({
              passwordHash: rows[0].password_hash,
              passwordSalt: rows[0].password_salt
            }));
            var hash = crypto.createHash('sha256').update(password).update(rows[0].password_salt).digest('hex');
            if(hash == rows[0].password_hash) {
              cb(null, uid);
            } else {
              cb('wrong user/pwd');
            }
          } else {
            cb('first user not open');
          }
        }
      });
    }
  });
};
exports.checkEmailPwd = function(emailAddress, password, cb) {
  memcache.get('pwd:'+emailAddress, function(err, valStr) {
    var val;
    try {
      val = JSON.parse(valStr);
    } catch(e) {
    }
    console.log('memcache', err, val);
    if(val) {
      var hash = crypto.createHash('sha256').update(password).update(val.passwordSalt).digest('hex');
      if(val.passwordHash == hash) {        
        cb(null, val.uid);
      } else {
        cb('wrong email/pwd (cached)');
      }
    } else {
      connection.query('SELECT `uid`, `status`, `password_hash`, `password_salt` FROM `customers`'
          +' WHERE `email_address` = ?',
          [emailAddress], function(err, rows) {
        console.log(err, rows);
        if(err) {
          cb('internal database error');
        } else {
          if(rows.length>=1 && rows[0].status<=USER.MAXOPEN) {
            memcache.set('pwd:'+emailAddress, JSON.stringify({
              passwordHash: rows[0].password_hash,
              passwordSalt: rows[0].password_salt,
              uid: rows[0].uid
            }));
            var hash = crypto.createHash('sha256').update(password).update(rows[0].password_salt).digest('hex');
            if(hash == rows[0].password_hash) {
              cb(null, rows[0].uid);
            } else {
              cb('wrong email/pwd');
            }
          } else {
            cb('first user not open');
          }
        }
      });
    }
  });
};
exports.deleteAccount = function(uid, cb) {
  //todo: remove products
  connection.query('UPDATE `customers` SET `status` = ? WHERE `uid` = ?', [USER.CLOSED, uid], cb);
};
/* dependencies to implement:
https://npmjs.org/package/mysql
https://npmjs.org/package/memcache
SendGrid
domainconf -> see how to interface with ggrin
*/
