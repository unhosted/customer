var mysql = require('mysql'),
  Memcache = require('memcache'),
  email = require('./email').email,
  uuid = require('node-uuid'),
  spawn = require('child_process').spawn,
  config = require('./config').config;

var connection = mysql.createConnection({
  host     : config.db.host,
  user     : config.db.user,
  password : config.db.password,
  database : config.db.database
});

connection.connect();

function genBearerToken() {
  return uuid();
}

function exec(scriptName, args, cb) {
  var script = spawn(scriptName, args),
    str = '';
  script.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
    str += data;
  });
  script.stderr.on('data', function (data) { console.log('stderr: ' + data); });
  script.on('close', function (code) {
    console.log('child process exited with code ' + code);
    //cb(str);
  });
}

exports.get = function(uid, origin, scope, cb) {
  var bearerToken = genBearerToken();
  connection.query('INSERT INTO `rstokens` (`uid`, `origin`, `scope`, `token`) VALUES (?, ?, ?, ?)', 
      [uid, origin, scope, bearerToken], function(err) {
    var args = ['rs'+uid, bearerToken].concat(scope.split(' '));
    exec('rs-add-token', args);
    console.log('bearer token '+bearerToken+' created for uid '+uid);
    cb(err, bearerToken);
  });
};

exports.revoke = function(uid, origin, token, cb) {
  if(typeof(cb) !== 'function') {
    throw("callback not given!");
  }
  console.log('revoking bearer token for '+uid+', '+origin+', '+token);
  connection.query('DELETE FROM `rstokens` WHERE `uid` = ? AND `origin` = ? AND `token` = ?', [uid, origin, token], function(err) {
    console.log('(bearer.revoke) DELETE returned: ', arguments);
    if(err) cb(err);
    else { exec('rs-remove-token', ['rs'+uid, token]); cb(); }
  });
};

exports.list = function(uid, cb) {
  connection.query('SELECT `origin`, `scope`, `token` FROM `rstokens` WHERE `uid`', [uid], function(err, rows) {
     cb(err, rows);//listing from db, hopefully this will always stay in sync with the output of rs-list-tokens
  });
};
