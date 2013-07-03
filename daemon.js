var connection = require('./server/db').connection,
  Twit = require('twit'),
  fs = require('fs');

function save(path, mimeType, data) {
  fs.writeFile(path, data, function(err) {
    console.log(path, err);
  });
}
function startThread(creds, path) {
  console.log(creds);
  var twit = new Twit(creds);
  var userStream = twit.stream('user');
  userStream.on('friends', function(friendsObj) {
    console.log(friendsObj);
    twit.get('users/lookup', {user_id: friendsObj.friends.join(',')}, function(err, reply) {
      if(err) {
        console.log(err);
      } else {
        for(var i=0; i<reply.length; i++) {
          console.log(reply[i].profile_image_url, reply[i].screen_name, reply[i].name);
          save(path+'/contacts/twitter/'+reply[i].screen_name, 'application/json', JSON.stringify({
            avatar: reply[i].profile_image_url,
            url: 'https://twitter.com/'+reply[i].screen_name,
            name: reply[i].name
          }));
        }
      }
    });
  });
  for(eventName in {user_event: true, connect: true, disconnect: true, limit: true, scrub_geo: true, delete: true, tweet: true}) {
    (function(en) {
      console.log('setting up listener', en);
      userStream.on(eventName, function(obj) { console.log(en, obj); });
    })(eventName);
  }
  console.log('setting up stream');
}
function start(cb) {
  connection.query('SELECT `twitter_credentials`, `uid` FROM `customers`',
      [], function(err, rows) {
    var creds;
    if(err) {
      cb(err);
    } else {
      for(var i=0; i<rows.length; i++) {
        creds=null;
        try {
          creds = JSON.parse(rows[i].twitter_credentials);
        } catch(e) {
          return cb(e);
        }
        connection.query('SELECT `username` FROM `remotestorage` WHERE `uid` = ?',
            [rows[i].uid], function(err2, rows) {
          if(err2) {
            return cb(err2);
          } else if(rows.length != 1) {
            return cb('not one storage for this customer');
          } else {
            fs.mkdir('/home/'+rows[0].username+'/storage', function(err3) {
              if(err3 && err3.code != 'EEXIST') {
                cb(err3);
              } else {
                fs.mkdir('/home/'+rows[0].username+'/storage/contacts', function(err4) {
                  if(err4 && err4.code != 'EEXIST') {
                    cb(err4);
                  } else {
                    fs.mkdir('/home/'+rows[0].username+'/storage/contacts/twitter', function(err5) {
                      if(err5 && err5.code != 'EEXIST') {
                        cb(err5);
                      } else {
                        startThread(creds, '/home/'+rows[0].username+'/storage');
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
      cb(null);
    }
  });
}

//.
start(function(err) {
  console.log('start', err);
});
