var mysql = require('mysql'),
  memcache = require('memcache'),
  email = require('../email').email,
  config = require('../config').config;

exports.createDomain = function(host, uid, admin, tech, ns) {
  return sql('INSERT INTO `domain` (`host`, `uid`, `admin`, `tech`, `ns`) VALUES'
      +' (%s, %i, %s, %s, %s)', host, uid, admin, tech, ns).then(function() {
    domainconf.set(host, admin, tech, ns);
  });
};
exports.updateDomain = function(host, uid, admin, tech, ns) {
  return sql('UPDATE `domain`'
        +' SET `uid` = %i, `admin` = %s `tech` = %s, `ns` = %s'
        +' WHERE host = %s', uid, admin, tech, ns, host).then(function() {
    domainconf.set(host, admin, tech, ns);
  });
};
exports.expireDomain = function(host) {
  return sql('UPDATE `domains` SET `status` = %i WHERE `host` = %s',
      DOMAIN.EXPIRED, host).then(function() {
    domainconf.set(host, null, null, null);
  });
};
