define(['./backtofront'], function(backtofront) {
  var pages = ['first', 'forgot', 'resetPwd', 'second', 'settings', 'cms', 'auth', 'error', 'auth-ask-allow'];

  window.onerror = backtofront.onerror = function(error, extra) {
    var message, details;
    if(typeof(error) === 'string') {
      message = error, details = extra;
    } else {
      message = error.message, details = error.stack;
    }
    client.showError(message, details);
  }

  Array.prototype.forEach.call(document.querySelectorAll('*[data-action]'), function(element) {
    var action = element.getAttribute('data-action');
    var args = element.getAttribute('data-action-args');
    if(action) {
      eval(action + "(" + (args || '') + ")");
    }
  });

  var client = {

    showPage: function(id) {
      for(var i=0; i<pages.length; i++) {
        $('page-'+pages[i]).style.display=(pages[i]==id?'block':'none');
      }
    },

    showError: function(message, details) {
      $('page-error-message').textContent = message;
      $('page-error-details').textContent = details;
      showPage('error');
    },

    showDefault: function() {
      if(localStorage.sessionKey) {
        showDashboard(localStorage.sessionKey);
      } else if(sessionStorage.sessionKey) {
        showDashboard(sessionStorage.sessionKey);
      } else {
        showPage('first');
      }
    },

    $: function(id) {
      return document.getElementById(id);
    },


    openForgotDialog: function() {
      showPage('forgot');
    },

    startForgotPassword: function() {
      customer.startForgotPassword($('email_forgot').value, localStorage.encrSolution, $('solution_forgot').value, function(err, data) {
        alert(err);
        alert(data);
      });
    },

    step1: function() {
      localStorage.fullName = $('fn').value;
      localStorage.email = $('email').value;
      localStorage.pwd = $('pwd').value;
      showPage('second');
    },

    genCaptcha: function() {
      customer.requestCaptcha(function(uri, encrSolution, encrSalt) {
        $('captcha').setAttribute('src', uri);
        $('captcha_forgot').setAttribute('src', uri);
        localStorage.encrSolution = encrSolution;
        localStorage.encrSalt = encrSalt;
      });
    },

    register: function() {
      customer.requestAccount(($('agree').checked?$('tos').innerHTML:''), localStorage.email, localStorage.pwd, localStorage.encrSolution, $('solution').value, $('host').value, function(err, result) {
        console.log('register err & result', err, result);
        if(err) {
          alert(JSON.stringify(err));
        } else {
          showDashboard(result);
        }
      });
    },

    signIn: function() {
      customer.getSession($('email1').value, $('pwd1').value, function(err, result) {
        if(err) {
          alert(err);
        } else {
          if($('remember').checked) {
            localStorage.sessionKey = result;
          }
          showDashboard(result);
        }
      });
    },

    showDashboard: function(sessionKey) {
      customer.getSettings(sessionKey, function(err, obj) {
        if(err) {
          alert(err);
        } else {
          $('settingsEmail').value = obj.email;
          if(obj.emailValidated) {
            $('validateEmail').style.display='none';
          }
        }
      });
      sessionStorage.sessionKey = sessionKey;
      showPage('cms');
    },

    changePwd: function() {
      customer.changePassword(sessionStorage.sessionKey, $('currentPwd').value, $('newPwd').value, function(err) {
        if(err) {
          alert(err);
        } else {
          alert('password changed!');
        }
      });
    },

    completeForgotPassword: function() {
      //a password reset session is somehow special in that it doesn't require retyping your current password:
      customer.completeForgotPassword(sessionStorage.resetPwd, $('password_reset').value, function(err, sessionKey) {
        if(err) {
          alert(err);
        } else {
          showDashboard(sessionKey);
          alert('Password reset. Now remember it, ok? ;)');
        }
      });
    },

    deleteAccount: function() {
      customer.deleteAccount(sessionStorage.sessionKey, $('currentPwd').value, function(err) {
        if(err) {
          alert(err);
        } else {
          logout();
          console.log('Sad to see you go. Have a nice life. Over and out!');
        }
      });
    },

    logout: function() {
      showPage('first');
      delete localStorage.sessionKey;
      delete sessionStorage.sessionKey;
    },

    jump: function(path) {
      history.pushState(null, null, '?!'+path);
      client.dispatch(path);
    },

    dispatch: function(path) {
      var action = actions[path];
      if(action) {
        action();
      } else {
        client.showError("Not Found", "Unrecognized path: " + path);
      }
    },

    showMessage: function(message) {
      var el = $('message');
      el.textContent = message;
      setTimeout(function() { if(el.textContent === message) el.textContent = '' }, 750);
    }
  };

  var _onconnects = [];
  var connected = false;
  function onconnect(f) { connected ? f() : _onconnects.push(f); }

  var backendUri = document.body.getAttribute('data-backend-uri');
  var backendSecret = document.body.getAttribute('data-backend-secret');
  backtofront.connect(backendUri, backendSecret, function() {
    if(location.hash.length) {
      //someone is trying to use a token, log out the current session:
      delete sessionStorage.sessionKey;
      //even if it was remembered:
      delete localStorage.sessionKey;
      var parts = location.hash.substring(1).split(':');
      location.hash = '';
      if(parts[0]=='verify') {
        customer.completeVerifyEmail(parts[1], function(err, sessionKey) {
          if(err) {
            showPage('first');
            alert(err);
          } else {
            showDashboard(sessionKey);
            alert('email address verified, thank you!');
          }
        });
      } else if(parts[0]=='reset_password') {
        sessionStorage.resetPwd = parts[1];
        showPage('resetPwd');
      } else if(parts[0]=='email_change') {
        customer.completeChangeEmail(parts[1], function(err, sessionKey) {
          if(err) {
            showPage('first');
            alert(err);
          } else {
            showDashboard(sessionKey);
            alert('email address changed!');
          }
        });
      } else {
        alert('ignoring hash '+JSON.stringify(parts));
        showPage('first');
      }
    } else {
      showDefault();
    }

    genCaptcha();
    //fillSettings();

    connected = true;
    _onconnects.forEach(function(f) { f(); });

  });
  client.auth = {
    allow: function() {
      var params = JSON.parse($('ask-params').value);
      customer.getBearerToken(sessionStorage.sessionKey, params.origin, params.scope, function(err, token) {
        if(err) {
          alert(err);
        } else {
          window.location = params.redirect_uri+'#access_token='+token;
        }
      });
    },
    revoke: function(origin, token) {
      customer.revokeBearerToken(sessionStorage.sessionKey, origin, token, function(err) {
        if(err) {
          alert(err);
        } else {
          showMessage('revoked!');
          client.auth.list();
        }
      });
    },
    list: function() {
      showPage('auth');
      customer.listBearerTokens(sessionStorage.sessionKey, function(err, rows) {
        if(err) {
          alert(err);
        } else {
          var str = '';
          for(var i=0; i<rows.length; i++) {
            str += '<tr><td>'+rows[i].origin+'</td><td>'+rows[i].scope+'</td><td><button onclick="auth.revoke(\''+rows[i].origin+'\', \''+rows[i].token+'\');">Revoke</button></td></tr>';
          }
          $('auth_list').innerHTML = str;
        }
      });
    },

    askAllow: function(params) {
      console.log('askAllow with params', params);
      if(params.scope && params.redirect_uri) {
        showPage('auth-ask-allow');
        var md = params.redirect_uri.match(/^(https?:\/\/[^\/]+)/);
        if(md) {
          params.origin = md[1];
          $('ask-origin').textContent = params.origin;
          params.scope.split(/[ +]/).forEach(function(scope) {
            var li = document.createElement('li');
            var parts = scope.split(':');
            var name = parts[0];
            var mode = parts[1];
            li.textContent = name + ' (' + mode + ')';
            $('ask-scopes').appendChild(li);
          });
          $('ask-params').value = JSON.stringify(params);
        } else {
          showError("Bad Request", "Invalid redirect_uri.");
        }
      } else {
        showError("Bad Request", "Insufficient parameters.");
      }
    }
  };

  window.onpopstate = function() {
    onconnect(function() {
      if(/^\?!/.test(location.search)) {
        client.dispatch(location.search.slice(2) || '/');
      } else if(location.search.length > 1) {
        var params = location.search.slice(1).split('&').reduce(function(p, keyval) {
          var kv = keyval.split('=');
          p[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1]).replace('+', ' ');
          return p;
        }, {});
        client.auth.askAllow(params);
      } else {
        client.showDefault();
      }
    });
  };

  var actions = {
    '/auth': client.auth.list,
    '/settings': function() { showPage('settings'); },
    '/': client.showDefault,
  };

  return client;
});
