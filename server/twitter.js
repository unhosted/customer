var Twit = require('twit'),
  fs = require('fs'),
  uuid = require('node-uuid');

exports.retrieve = function(keys, cb) {
  var twit = new Twit(keys);
  //twit.get('users/lookup', function(err, reply) {
  //  console.log(err, reply);
  //});

  //fs.mkdirSync('storage/');
  //fs.mkdirSync('storage/microblog/');
  //fs.mkdirSync('storage/microblog/microposts/');
  //fs.mkdirSync('storage/profile/');
  //fs.mkdirSync('storage/www/');
  twit.get('statuses/user_timeline', function(err, tweets) {
    var profileSaved = false;
    //console.log(err, tweets);
    for(var i = 0; i<tweets.length; i++) {
      //console.log(tweets[i].text);
      //console.log(tweets[i].created_at);
      fs.writeFile('storage/microblog/microposts/'+uuid(), JSON.stringify({
        text: tweets[i].text,
        created_at: tweets[i].created_at
      }), function(err) {
        if(err) {
          console.log(err);
        }
      });
      //console.log(tweets[i].user.screen_name);
      //console.log(tweets[i].user.name);
      //console.log(tweets[i].user.profile_image_url);
      //console.log(tweets[i].user.url);
      //console.log(tweets[i].user.description);
      //console.log(tweets[i].user.location);
      if(!profileSaved) {
        saveProfile(tweets[i].user, cb);
        profileSaved = true;
      }
    }
  });
};
function saveProfile(user, cb) {
  fs.mkdir('storage/www/'+user.screen_name+'.un.ht/', function(err) {
    fs.mkdir('storage/www/'+user.screen_name+'.un.ht/.well-known/', function(err) {
      fs.writeFile('storage/www/'+user.screen_name+'.un.ht/.well-known/webfinger', JSON.stringify({
        hello: 'world'
      }));
    });
    fs.writeFile('storage/www/'+user.screen_name+'.un.ht/index.html', '<html><h1>Welcome to the website of '+user.name+'</h1></html>');
  });
  fs.writeFile('storage/profile/me', JSON.stringify({
    screen_name: user.screen_name,
    name: user.name,
    profile_image_url: user.profile_image_url,
    url: user.url,
    description: user.description,
    location: user.location
  }), function(err) {
    if(err) {
      console.log(err);
    }
  });
  cb(null, user.screen_name);
}
