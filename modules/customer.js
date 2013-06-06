var mysql = require('mysql'),
  memcache = require('memcache'),
  email = require('../email').email,
  config = require('../config').config;

var connection = mysql.createConnection({
  host     : config.db.host,
  user     : config.db.user,
  password : config.db.password,
});

connection.connect();

connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
  if (err) throw err;

  console.log('The solution is: ', rows[0].solution);
});

connection.end();

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

exports.createUser = function(emailAddress, passwordHash) {
  var token = genToken();
  return sql('INSERT INTO `customers` (`email_address`, `password_hash`, `token`, `status`) VALUES (%s, %s, %s)', emailAddress, passwordHash, token, USER.FRESH).then(function() {
    var uid = sql.lastId();
    email.verify(fields.email_address, token+'_'+uid);
    return uid;
  });
};
exports.verifyEmail = function(tokenUid) {
  var parts = tokenUid.split('_');
  return sql('UPDATE `customers` SET `status`= %i'
      +' WHERE `status` = %i AND `token` = %s AND `uid` = %i',
      USER.VERIFIED, USER.FRESH, token, uid);
};
exports.startResetPassword = function(uid) {
  var token = genToken();
  return sql('UPDATE `customers` SET `status` = %i, `token` = %s'
      +' WHERE `uid` = %i', USER.RESETTING, token, uid).then(function() {
    return sql('SELECT `email_address` from `customers` WHERE uid = %i', uid).then(function(currentEmail) {
      return email.resetPassword(currentEmail, token);
    });
  });
};
exports.startEmailChange = function(uid, newEmail) {
  var token = genToken();
  return sql('UPDATE `customers` SET `status` = %i, `new_email_address` = %s,'
      +' `token` = %s WHERE `uid` = %i',
      USER.CHANGING, newEmail, uid, token).then(function() {
    return sql('SELECT `email_address` from `customers` WHERE uid = %i', uid).then(function(currentEmail) {
      return email.changeTo(newEmail, token+'_'+uid).then(function() {
        return email.changeFrom(currentEmail);
      });
    });
  });
};
exports.changePwd = function(emailAddress, newPasswordHash) {
  return sql('UPDATE `customers` SET `password_hash` = %s'
      +' WHERE `email_address` = %s', newPasswordHash, emailAddress).then(function() {
    memcache.invalidate('pwd:'+emailAddress);
  });
};
exports.checkEmailPwd = function(emailAddress, passwordHash) {
  return memcache.get('pwd:'+emailAddress).then(function(val) {
    if(val) {
      return val==passwordHash;
    } else {
      return sql('SELECT `uid`, `status` FROM `customers`'
      +' WHERE `email_address` = %s AND `password_hash` = %s',
      emailAddress, passwordHash).then(function(rows) {
        if(rows.length==1 && rows[0].status<=USER.MAXOPEN) {
          return memcache.set('pwd:'+emailAddress, rows[0].uid);
        }
        return false;
      });
    }
  });
};
exports.deleteUser = function(uid) {
  //todo: remove products
  return sql('UPDATE `status` = %i WHERE `uid` = %i', USER.CLOSED, uid);
};
/* dependencies to implement:
https://npmjs.org/package/mysql
https://npmjs.org/package/memcache
SendGrid
domainconf -> see how to interface with ggrin
*/
