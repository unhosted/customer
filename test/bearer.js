var bearer = require('../server/bearer.js');

var tests = [
  function(passIf) {
    bearer.get(11, 'http://example.com', 'foo:r bar:rw', function(err) {
      passIf(err==null);
    });
  }
];

for(var i = 0; i<tests.length; i++) (function(i) {
  tests[i](function(success) {
    console.log(success?'PASS ':'FAIL '+i);
  });
})(i);
