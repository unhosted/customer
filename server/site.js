var fs = require('fs');
exports.setUpSite = function(host, user, cb) {
  fs.symlink('/home/customer-backend/webserver/www/'+host+'.un.ht', '/home/'+user, cb);
} 
