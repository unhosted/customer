var domain = require('../server/domain.js');

var tests = [
  function(passIf) {
    domain.create(12, 'bla', 'admin', 'tech', 'ns', function(err) {
      passIf(err==null);
    });
  }
];

for(var i = 0; i<tests.length; i++) (function(i) {
  tests[i](function(success) {
    console.log(success?'PASS ':'FAIL '+i);
  });
})(i);
