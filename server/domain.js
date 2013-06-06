var mysql = require('mysql'),
  memcache = require('memcache'),
  email = require('./email').email,
  spawn = require('child_process').spawn,
  config = require('./config').config;

var DOMAIN = {
  PENDING: 0,
  ACTIVE: 1,
  EXPIRED: 2
};

var connection = mysql.createConnection({
  host     : config.db.host,
  user     : config.db.user,
  password : config.db.password,
  database : config.db.database
});

connection.connect();

function dnr(host, add, cb) {
  var dnr  = spawn(config.deploy.dnr, [(add?'1':'0'), host]);

  dnr.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
  });

  dnr..stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });

  dnr.on('close', function (code) {
    console.log('child process exited with code ' + code);
    cb(code);
  });
}

exports.createDomain = function(host, uid, admin, tech, ns, cb) {
  connection.query('INSERT INTO `domains` (`host`, `uid`, `admin`, `tech`, `ns`) VALUES (?, ?, ?, ?, ?)', 
      [host, uid, admin, tech, ns], function(err, data) {
    dnr(host, true, cb);
  });
};
exports.updateDomain = function(host, uid, admin, tech, ns, cb) {
  connection.query('UPDATE `domains` SET `uid` = ?, `admin` = ?, `tech` = ?, `ns` =? WHERE host = ?',
        [uid, admin, tech, ns, host], function(err, data) {
  });
};
exports.expireDomain = function(host, cb) {
  connection.query('UPDATE `domains` SET `status` = ? WHERE `host` = ?',
      [DOMAIN.EXPIRED, host], function(err, data) {
    dnr(host, false, cb);
  });
};
