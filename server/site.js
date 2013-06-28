var fs = require('fs');
exports.create = function(uid, host, storageObj, cb) {
  console.log('site.create', uid, host, storageObj);
  fs.symlink(storageObj.filePath, '/home/customer-backend/webserver/www/'+host, function(err) {
    if(err && err.code=='EEXIST') {
      err=null;
    }
    cb(err, {
      product: 'site',
      ipaddress: '217.11.53.245',
      vhost: host
    });
  });
}
