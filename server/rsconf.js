exports.rsconf = {
  setup: function(server, username, quota, cb) {
    console.log(server, username, quota, cb);
    console.log('pretending to setup rsconf...');
    cb();
  }
};
