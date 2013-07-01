var site = require('../server/site.js');

var tests = [
  function(passIf) {
    site.create(12, 'bla', {filePath: '/home/customer-backend/customer/test/testDir'}, function(err) {
      passIf(err==null);
    });
  }
];

for(var i = 0; i<tests.length; i++) (function(i) {
  tests[i](function(success) {
    console.log(success?'PASS ':'FAIL '+i);
  });
})(i);
