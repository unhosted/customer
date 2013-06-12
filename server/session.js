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

function genSessionToken() {
  return uuid();
}

exports.create = function(uid, cb) {
  var sessionToken = genSessionToken();
  connection.query('INSERT INTO `sessions` (`uid`, `token`) VALUES (?, ?)', 
      [uid, sessionToken], function(err4) {
    cb(null, sessionToken);
  });
};

exports.getUid = function(sessionKey, cb) {
  console.log('looking up uid for sessionKey', sessionKey);
  connection.query('SELECT `uid` FROM `sessions` WHERE `token` = ?', [sessionKey], function(err, rows) {
    if(err) {
      cb(err);
    } else if(rows.length != 1) {
      cb('session not found for key');
    } else {
      cb(err, rows[0].uid);
    }
  });
};
    
