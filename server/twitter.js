var Twit = require('twit');

exports.check = function(keys, cb) {
  var twit;
  try {
    twit = new Twit(keys);
  } catch(e) {
    cb(e);
    return;
  }
  twit.get('statuses/user_timeline', function(err, tweets) {
    if(tweets && tweets.length >= 1) {
      cb(null, tweets[0].user.screen_name);
    } else {
      cb('could not find out the screen_name from that user\'s tweets');
    }
  });
};
