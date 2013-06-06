var captchagen = require('captchagen');

var pending = {};

function genToken() {
  return 'asdf';
}

exports.get = function(cb) {
  var token = genToken();
  pending[token] = captchagen.generate();
  pending[token].uri(function(err, uri) {
    cb(uri, token);
    console.log(pending[token].text());
  });
};

exports.resolve = function(token, solution, cb) {
  console.log(pending[token], pending[token].text(), solution);
  cb(pending[token] && pending[token].text() == solution);
};
