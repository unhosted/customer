exports.domainconf = {
  set: function(host, admin, tech, ns, cb) {
    console.log(host, admin, tech, ns, cb);
    console.log('pretending to set domainconf...');
    cb();
  }
};
