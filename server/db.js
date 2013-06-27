var mysql = require('mysql'),
  config = require('./config').config;

var connection = mysql.createConnection({
  host     : config.db.host,
  user     : config.db.user,
  password : config.db.password,
  database : config.db.database
});

connection.connect(function(e) {
  console.log('caught', e);
});

exports.connection = connection;
