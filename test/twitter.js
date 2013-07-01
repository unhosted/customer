var twitter = require('../server/twitter.js');

var tests = [
  function(passIf) {
    twitter.check({
      consumer_key: 'gyIyoqTz5E9lZ4awluZA',
      consumer_secret: 'IIx6EU4Zm5pBaAlbSyh44E9kTlIBD33gsNaYLXpSg',
      access_token: '117074576-Sbt8R42ml2XdkH2M6KII1rCGio7pn8Fnmghjo1pp',
      access_token_secret: 'YvSBLNGdDkSPpclkOTwMSxkOh3LasEw4KtaqkmK1aE'
    }, function(err, handle) {
      passIf(err==null && handle == 'michielbdejong');
    });
  },
  function(passIf) {
    twitter.check({
      consumer_key: 'gyIyoqTz5E9lZ4awluZ',
      consumer_secret: 'IIx6EU4Zm5pBaAlbSyh44E9kTlIBD33gsNaYLXpS',
      access_token: 'v117074576-Sbt8R42ml2XdkH2M6KII1rCGio7pn8Fnmghjo1p',
      access_token_secret: 'YvSBLNGdDkSPpclkOTwMSxkOh3LasEw4KtaqkmK1a'
    }, function(err, handle) {
      passIf(err!=null);
    });
  },
  function(passIf) {
    twitter.check({
    }, function(err, handle) {
      passIf(err!=null);
    });
  }
];

for(var i = 0; i<tests.length; i++) (function(i) {
  tests[i](function(success) {
    console.log(success?'PASS ':'FAIL '+i);
  });
})(i);
