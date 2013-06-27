var fs = require('fs');
exports.setUpSite = function(uid, host, storageObj, cb) {
  fs.symlink('/home/customer-backend/webserver/www/'+host, storageObj.filePath, function(err) {
    cb(err, {
      product: 'site',
      ipaddress: '123.123.123.123',
      vhost: host
    });
  });
}
