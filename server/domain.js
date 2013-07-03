var connection = require('./db').connection,
  memcache = require('memcache'),
  email = require('./email').email,
  spawn = require('child_process').spawn,
  config = require('./config').config;

var DOMAIN = {
  PENDING: 0,
  ACTIVE: 1,
  EXPIRED: 2
};

function deploy(host, uid, cb) {
  var script = spawn(config.deploy.domain, [host, uid]),
    str = '',
    failed = false;
  script.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
    str += data;
  });
  script.stderr.on('data', function (data) {
    if(data.toString().indexOf('failed') != -1) {
      failed = data.toString();
    }
    console.log('stderr: ' + data);
  });
  script.on('close', function (code) {
    console.log('child process exited with code ' + code);
    cb((failed?failed:(code == 0?null:code)), str);
  });
}

//* make list of reserved names
//  - nic, root, www, example, unhosted,
//  - anything implying authority or officialness
//  - anything <= 3 letters (at least <= 2 letters implies authority, like language/country codes),
//  - http://tools.ietf.org/html/rfc6761
//  - pastefinger.un.ht
//  - ...

exports.create = function(uid, host, admin, tech, ns, cb) {
  deploy(host, 10000+uid, cb);
  return;
  deploy(host, 10000+uid, function(err, key) {
    console.log('deploy error:', err);
    if(err) {
      cb(err);
    } else {
      connection.query('INSERT INTO `domains` (`host`, `uid`, `admin`, `tech`, `ns`) VALUES (?, ?, ?, ?, ?)', 
          [host, uid, admin, tech, ns], cb);
    }
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
