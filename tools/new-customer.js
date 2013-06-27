#!/usr/bin/env node

if(process.argv.length != 5) {
  console.log("Usage: " + process.argv[1] + " <username> <email> <password>");
  process.exit(127);
}

var customer = require('../server/customer');
var rs = require('../server/rs');

var username = process.argv[2], email = process.argv[3], password = process.argv[4];

console.log('CREATE ACCOUNT');
customer.createAccount(email, password, function(err, uid) {
  if(err) {
    console.error("ERROR: ", err);
    process.exit(1);
  } else {
    console.log('CREATE REMOTESTORAGE');
    rs.createRemotestorage(uid, 0, username, 5000, function(err) {
      if(err) {
        console.log('ERROR: ', err);
        process.exit(2);
      } else {
        console.log('done.');
        process.exit(0);
      }
    });
  }
}, { skipVerify: true });