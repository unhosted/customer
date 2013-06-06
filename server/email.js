exports.email = {
  verify: function(email, tokenUid, cb) {
    console.log('pretending to send verify email...');
    cb();
  },
  changeFrom: function(oldEmail, cb) {
    console.log('pretending to send changeFrom email...');
    cb();
  },
  changeTo: function(newEmail, tokenUid, cb) {
    console.log('pretending to send changeTo email...');
    cb();
  },
  resetPassword: function(email, tokenUid, cb) {
    console.log('pretending to send resetPassword email...');
    cb();
  }
};
