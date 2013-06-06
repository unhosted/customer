var mysql = require('mysql'),
  memcache = require('memcache'),
  email = require('../email').email,
  config = require('../config').config;

exports.createRemotestorage = function(uid, server, username, quota) {
  return sql('INSERT INTO `remotestorage` (`uid`, `server`, `username`, `quota`)'
      +' VALUES (%i, %i, %s, %i)', uid, server, username, quota).then(function() {
    remotestorage.setup(server, username, quota);
  });
};
