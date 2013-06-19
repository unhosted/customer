
var APP_URL = 'https://unht-customer-beta.5apps.com/';

var SendGrid = require('sendgrid').SendGrid,
  config = require('./config').config,
  sendgrid = new SendGrid(config.sendgrid.user, config.sendgrid.password),
  templates = {
    verify: ['Your unhosted account is almost ready!', 'Please visit '+APP_URL+'#verify:'],
    changeFrom: ['Someone changed your email address!', 'If this wasn\'t you then please contact support!'],
    changeTo: ['Your email address is almost changed!', 'Please visit '+APP_URL+'#email_change:'],
    resetPassword: ['Your password is almost reset!', 'To choose your new password, please visit '+APP_URL+'#reset_password:']
  };
function sendTemplate(to, template, vars, cb) {
  if(vars) {
    sendgrid.send({
      to: to,
      from: 'support@unhosted.org',
      subject: templates[template][0],
      text: templates[template][1]+vars.token
    }, function(success, message) {
       if(success) {
         cb(null);
       } else if(message) {
         cb(message);
       } else {
         cb('sendgrid failure, no message');
       }
    });
  }
}
exports.email = {
  verify: function(email, tokenUid, cb) {
    console.log('Sending verify email to '+email);
    sendTemplate(email, 'verify', {token: tokenUid}, cb);
  },
  changeFrom: function(oldEmail, cb) {
    console.log('Sending changeFrom email to '+oldEmail);
    sendTemplate(oldEmail, 'changeFrom', null, cb);
  },
  changeTo: function(newEmail, tokenUid, cb) {
    console.log('Sending changeTo email to '+newEmail);
    sendTemplate(newEmail, 'changeTo', {token: tokenUid}, cb);
  },
  resetPassword: function(email, tokenUid, cb) {
    console.log('Sending resetPassword email to '+email);
    sendTemplate(email, 'resetPassword', {token: tokenUid}, cb);
  }
};
