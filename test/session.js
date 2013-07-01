var session = require('../server/session.js');

var tests = [
  function(passIf) {
    session.create(12, function(err) {
      passIf(err==null);
    });
  }
];

for(var i = 0; i<tests.length; i++) (function(i) {
  tests[i](function(success) {
    console.log(success?'PASS ':'FAIL '+i);
  });
})(i);
