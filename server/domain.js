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

function genNewKey(cb) {
  var keygen = spawn(config.deploy.keygen, []),
    str = '';
  dns.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
    str += data;
  });
  dns.stderr.on('data', function (data) { console.log('stderr: ' + data); });
  dns.on('close', function (code) {
    console.log('child process exited with code ' + code);
    cb(str);
  });
}

function addZone(host, key, cb) {
  var dns  = spawn(config.deploy.dns, [host, key]);
  dns.stdout.on('data', function (data) { console.log('stdout: ' + data); });
  dns.stderr.on('data', function (data) { console.log('stderr: ' + data); });
  dns.on('close', function (code) {
    console.log('child process exited with code ' + code);
    cb(code);
  });
}

function dnr(host, add, cb) {
  var dnr  = spawn(config.deploy.dnr, [host]);
  dnr.stdout.on('data', function (data) { console.log('stdout: ' + data); });
  dnr.stderr.on('data', function (data) { console.log('stderr: ' + data); });
  dnr.on('close', function (code) {
    console.log('child process exited with code ' + code);
    cb(code);
  });
}

//* make list of reserved names
//  - nic, root, www, example, unhosted,
//  - anything implying authority or officialness
//  - anything <= 3 letters (at least <= 2 letters implies authority, like language/country codes),
//  - http://tools.ietf.org/html/rfc6761 ...)


exports.createDomain = function(host, uid, admin, tech, ns, cb) {
  genNewKey(function(key) {
    connection.query('INSERT INTO `domains` (`host`, `uid`, `admin`, `tech`, `ns`) VALUES (?, ?, ?, ?, ?)', 
        [host, uid, admin, tech, ns], function(err, data) {
      connection.query('INSERT INTO `zones` (`host`, `uid`, `key`) VALUES (?, ?, ?)', 
          [host, uid, key], function(err2, data2) {
        dns(host, key, function(err3) {
          if(!err3) {
            dnr(host, true, cb);
          }
        });
      });
    });
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
