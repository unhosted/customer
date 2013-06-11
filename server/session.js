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
}
