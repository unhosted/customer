var mysql = require('mysql'),
  memcache = require('memcache'),
  email = require('../email').email,
  domainconf = require('../domainconf').domainconf,
  config = require('../config').config;

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

exports.createDomain = function(host, uid, admin, tech, ns, cb) {
  connection.query('INSERT INTO `domain` (`host`, `uid`, `admin`, `tech`, `ns`) VALUES'
      +' (?, ?, ?, ?, ?)', [host, uid, admin, tech, ns], function(err, data) {
    domainconf.set(host, admin, tech, ns, cb);
  });
};
exports.updateDomain = function(host, uid, admin, tech, ns, cb) {
  connection.query('UPDATE `domain`'
        +' SET `uid` = ?, `admin` = ?, `tech` = ?, `ns` =?'
        +' WHERE host = ?', [uid, admin, tech, ns, host], function(err, data) {
    domainconf.set(host, admin, tech, ns, cb);
  });
};
exports.expireDomain = function(host, cb) {
  connection.query('UPDATE `domains` SET `status` = ? WHERE `host` = ?',
      [DOMAIN.EXPIRED, host], function(err, data) {
    domainconf.set(host, null, null, null, cb);
  });
};
