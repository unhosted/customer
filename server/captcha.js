var captchagen = require('captchagen'),
  crypto = require('crypto'),
  config = require('./config').config;


function genEncryptedSolution(txt) {
  console.log('salt', config.captchaSolutionSalt);
  var shasum = crypto.createHash('sha1');
  shasum.update(config.captchaSolutionSalt, 'utf-8');
  shasum.update(txt, 'utf-8');
  return shasum.digest('hex');
}

exports.get = function(cb) {
  var captcha = captchagen.generate(),
    encryptedSolution = genEncryptedSolution(captcha.text());
  captcha.uri(function(err, uri) {
    cb(uri, encryptedSolution);
  });
};

exports.resolve = function(encryptedSolution, candidateSolution, cb) {
  return (genEncryptedSolution(candidateSolution) == encryptedSolution);
}
