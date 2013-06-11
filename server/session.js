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

function genSessionToken() {
  return '1234';
}

exports.create = function(uid, cb) {
  var sessionToken = genSessionToken();
  connection.query('INSERT INTO `sessions` (`uid`, `token`) VALUES (?, ?)', 
      [uid, sessionToken], function(err4) {
    cb(null, sessionToken);
  });
}
