var mysql = require('mysql'),
  rsconf = require('./rsconf').rsconf,
  config = require('./config').config;

var connection = mysql.createConnection({
  host     : config.db.host,
  user     : config.db.user,
  password : config.db.password,
  database : config.db.database
});

connection.connect();

exports.createRemotestorage = function(uid, server, username, quota, cb) {
  connection.query('INSERT INTO `remotestorage` (`uid`, `server`, `username`, `quota`)'
      +' VALUES (?, ?, ?, ?)', [uid, server, username, quota], function(err, data) {
    rsconf.setup(server, username, quota, cb);
  });
};
