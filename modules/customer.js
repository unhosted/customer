var mysql = require('mysql'),
  Memcache = require('memcache'),
  email = require('../email').email,
  config = require('../config').config;

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

exports.createUser = function(emailAddress, passwordHash, cb) {
  var token = genToken();
  connection.query('INSERT INTO `customers` (`email_address`, `password_hash`, `token`, `status`) VALUES (?, ?, ?, ?)', [emailAddress, passwordHash, token, USER.FRESH], function(err, data) {
    if(err) {
      cb(err);
    } else {
      var uid = data.insertId;
      email.verify(emailAddress, token+'_'+uid);
      cb(err, uid);
    }
  });
};
exports.verifyEmail = function(tokenUid, cb) {
  var parts = tokenUid.split('_');
  connection.query('UPDATE `customers` SET `status`= ?'
      +' WHERE `status` = ? AND `token` = ? AND `uid` = ?',
      [USER.VERIFIED, USER.FRESH, parts[0], parts[1]], cb);
};
exports.startResetPassword = function(uid, cb) {
  var token = genToken();
  connection.query('UPDATE `customers` SET `status` = ?, `token` = ?'
      +' WHERE `uid` = ?', [USER.RESETTING, token, uid], function(err, data) {
    connection.query('SELECT `email_address` from `customers` WHERE uid = ?', [uid], function(err, currentEmail) {
      email.resetPassword(currentEmail, token+'_'+uid, cb);
    });
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
exports.changePwd = function(emailAddress, newPasswordHash, cb) {
  connection.query('UPDATE `customers` SET `password_hash` = ?'
      +' WHERE `email_address` = ?', [newPasswordHash, emailAddress], function(err, result) {
    memcache.delete('pwd:'+emailAddress);
    cb();
  });
};
exports.checkEmailPwd = function(emailAddress, passwordHash, cb) {
  memcache.get('pwd:'+emailAddress, function(err, val) {
    if(val) {
      return val==passwordHash;
    } else {
      connection.query('SELECT `uid`, `status` FROM `customers`'
          +' WHERE `email_address` = ? AND `password_hash` = ?',
          [emailAddress, passwordHash], function(err, rows) {
        console.log(err, rows);
        if(err) {
          cb(false);
        } else {
          if(rows.length==1 && rows[0].status<=USER.MAXOPEN) {
            memcache.set('pwd:'+emailAddress, rows[0].uid);
            cb(null, rows[0].uid);
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
