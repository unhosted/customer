var customer = require('../server/customer.js');

var tests = [
  function(passIf) {
    customer.createAccount('test@example.com', 'bla', function(err) {
      passIf(err==null);
    });
  }
];

for(var i = 0; i<tests.length; i++) (function(i) {
  tests[i](function(success) {
    console.log(success?'PASS ':'FAIL '+i);
  });
})(i);
