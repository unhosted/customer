#!/usr/bin/env node

var customer = require('../server/customer');

customer.listAccounts(function(err, accts) {
  console.log(accts);
  process.exit();
});