var mysql = require('mysql'),
  Memcache = require('memcache'),
  email = require('./email').email,
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

  //console.log('The solution is: ', rows[0].solution);
});

var USER = {
  FRESH: 0,
  VERIFIED: 1,
  CHANGING: 2,
  RESETTING: 3,
  MAXOPEN: 3,//all states up to here are 'open', the ones below will not allow logging in
  SUSPENDED: 4,
  CLOSED: 5
};

function genToken() {
  return 'asdf';
}
function genSalt() {
  return 'salty dogs';
}
function hashPwd(pwd, salt, alg) {
  return 'deadbeef';
}

exports.createAccount = function(emailAddress, passwordHash, cb) {
  var token = genToken(),
    salt = genSalt();
  var connection.query('INSERT INTO `customers` (`email_address`, `password_hash`, `salt`, `algorithm`, `token`, `status`) VALUES (?, ?, ?, ?)', [emailAddress, passwordHash, salt, 0, token, USER.FRESH], function(err, data) {
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
      [USER.VERIFIED, USER.FRESH, parts[0], parts[1]], cb);
};
exports.startResetPassword = function(emailAddress, cb) {
  var token = genToken();
  connection.query('UPDATE `customers` SET `status` = ?, `token` = ?'
      +' WHERE `email_address` = ?', [USER.RESETTING, token, emailAddress], function(err, data) {
    email.resetPassword(emailAddress, token+'_'+uid, cb);
  });
};
exports.startEmailChange = function(uid, newEmail, cb) {
  var token = genToken();
  connection.query('UPDATE `customers` SET `status` = ?, `new_email_address` = ?,'
      +' `token` = ? WHERE `uid` = ?',
      [USER.CHANGING, newEmail, uid, token], function(err1, data) {
    connection.query('SELECT `email_address` from `customers` WHERE uid = ?', [uid], function(err2, currentEmail) {
      email.changeTo(newEmail, token+'_'+uid, function(err3) {
        email.changeFrom(currentEmail, cb);
      });
    });
  });
};
exports.changePwd = function(emailAddress, newPassword, cb) {
  var newSalt = genSalt();
  var newPasswordHash = hashPwd(newPassword, newSalt, 0);
  connection.query('UPDATE `customers` SET `password_hash` = ?, `salt` = ?, `algorithm` = ?',
      +' WHERE `email_address` = ?', [newPasswordHash, newSalt, emailAddress], function(err, result) {
    memcache.delete('pwd:'+emailAddress);
    cb();
  });
};
exports.checkEmailPwd = function(emailAddress, password, cb) {
  memcache.get('pwd:'+emailAddress, function(err, val) {
    if(val) {
      return val==passwordHash;
    } else {
      connection.query('SELECT `uid`, `status`, `password_hash`, `salt`, `algorithm` FROM `customers`'
          +' WHERE `email_address` = ?',
          [emailAddress], function(err, rows) {
        console.log(err, rows);
        if(err) {
          cb(err);
        } else {
          if(rows.length==1) {
            if(rows[0].status<=USER.MAXOPEN) {
              memcache.set('pwd:'+emailAddress, JSON.stringify(rows[0]));
              if(hashPwd(password, rows[0].salt, 0) == rows[0].password_hash) {
                cb(null, rows[0].uid);
              } else {
                cb('email known but wrong pwd');
              }
            } else {
              cb('user not open');
            }
          } else {
            cb('email unknown');
          }
        }
      });
    }
  });
};
exports.deleteUser = function(uid, cb) {
  //todo: remove products
  connection.query('UPDATE `customers` SET `status` = ? WHERE `uid` = ?', [USER.CLOSED, uid], cb);
};
/* dependencies to implement:
https://npmjs.org/package/mysql
https://npmjs.org/package/memcache
SendGrid
domainconf -> see how to interface with ggrin
*/
