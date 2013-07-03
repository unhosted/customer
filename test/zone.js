var zone = require('../server/zone.js');

var tests = [
  function(passIf) {
    zone.create(12, 'bla', function(err) {
      passIf(err==null);
    });
  }
];

for(var i = 0; i<tests.length; i++) (function(i) {
  tests[i](function(success) {
    console.log(success?'PASS ':'FAIL '+i);
  });
})(i);
