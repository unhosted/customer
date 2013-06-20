var mysql = require('mysql'),
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
    if(err) {
      cb(err);
    } else {
      console.log(server, username, quota, cb);
      console.log('pretending to setup rsconf...');
      cb();
    }
  });
};
