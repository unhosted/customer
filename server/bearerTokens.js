var mysql = require('mysql'),
  Memcache = require('memcache'),
  email = require('./email').email,
  uuid = require('node-uuid'),
  config = require('./config').config;

var connection = mysql.createConnection({
  host     : config.db.host,
  user     : config.db.user,
  password : config.db.password,
  database : config.db.database
});

connection.connect();

function genBearerToken() {
  return uuid();
}

exports.get = function(uid, origin, scope, cb) {
  var bearerToken = genBearerToken();
  connection.query('INSERT INTO `rstokens` (`uid`, `origin`, `scope`, `token`) VALUES (?, ?, ?, ?)', 
      [uid, origin, scope, bearerToken], function(err) {
    console.log('bearer token '+bearerToken+' created for uid '+uid);
    cb(err, bearerToken);
  });
};

exports.revoke = function(uid, origin, cb) {
  console.log('revoking bearer token for '+uid+', '+origin);
  connection.query('DELETE FROM `rstokens` WHERE `uid` = ? AND `origin` = ?', [uid, origin], function(err) {
     cb(err);
  });
};

exports.list = function(uid, cb) {
  connection.query('SELECT `origin`, `scope`, `token` FROM `rstokens` WHERE `uid`', [uid], function(err, rows) {
     cb(err, rows);
  });
};
