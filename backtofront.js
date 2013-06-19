if(typeof(window) != 'undefined') {//client
  var backtofront = {};
  if(typeof(window.define) === 'function') {
    define([], function() { return backtofront; });
  } else {
    window.backtofront = backtofront;
  }
  backtofront.connect = function(url, token, cb) {
    var sock = new WebSocket(url);
    var open = false;
    sock.onopen = function() {
      console.log('open');
    };
      open = true;
    sock.onmessage = function(e) {
      var obj;
      try {
        obj = JSON.parse(e.data);
      } catch(e) {
        obj = { type: 'unparseable'};
      }
      console.log('incoming', e.data);
      if(obj.type=='register') {
        for(var i in obj.modules) {
          window[i] = {};
          for(var j in obj.modules[i]) {
            if(obj.modules[i][j]=='default') {
              window[i][j] = (function(module, method) {
                return function() {
                  send(module, method, arguments);
                };
              })(i, j);
            }
          }
        }
        if(typeof(cb)=='function') {
          cb();
        }
      } else if(obj.error) {
        if(backtofront.onerror) {
          backtofront.onerror(obj.error);
        } else {
          console.error("UNCAUGHT ERROR:", obj.error);
        }
      } else {
        if(running[obj.callback]) {
          console.log('running', typeof(running[obj.callback]), obj.args);
          running[obj.callback].apply(null, obj.args);
          //delete running[obj.callback];
        } else {
          console.log('not found', running);
        }
      }
     };
    sock.onclose = function() {
      console.log('closed');
      if(backtofront.onerror) {
        if(open) {
          backtofront.onerror('connection-closed', "Connection was closed. Reload to save the day.");
        } else {
          backtofront.onerror('connection-failed', "Failed to connect to backend.");
        }
      }
    };
    var running = {};
    function send(module, method, args) {
      for(var i=0; i<args.length; i++) {
        if(typeof(args[i])=='function') {
          id = new Date().getTime()+'-'+running.length;
          running[id] = args[i];
          args[i]='_function_'+id;
        } else if (typeof(args[i])=='string') {
          args[i] = '_string_'+args[i];
        }
      }
      var obj = {
        module: module,
        method: method,
        token: token,
        args: args
      };
      sock.send(JSON.stringify(obj));
    }
  };
} else {//server:
  var sockjs = require('sockjs'),
      fs = require('fs'),
      https = require('https'),
      argv = require('process').argv;
  console.log(argv);
  var httpsServer = https.createServer({ 
    key: fs.readFileSync('./tls/tls.key'), 
    cert: fs.readFileSync('./tls/tls.cert'), 
    ca: fs.readFileSync('./tls/ca.pem') 
  }, function(req, res) {
    res.writeHead(200);
    res.end('connect a websocket please'); 
  });
  httpsServer.listen(argv[2]);
  console.log('listening on port '+argv[3]);

  var sockServer = sockjs.createServer();
  sockServer.on('connection', function(conn) {
    var methodNames = {};
    for(var i in modules) {
      methodNames[i]={};
      for(var j in modules[i]) {
        methodNames[i][j]='default';
      }
    }
    conn.write(JSON.stringify({
      type: 'register',
      modules: methodNames
    }));
    //FIXME: does this work with messages of >32Kb?
    conn.on('data', function(chunk) {
      var obj, argList=[];
      try {
        obj = JSON.parse(chunk);
      } catch(e) {
      }
      console.log(obj);
      if((typeof(obj) == 'object') && (obj.token == argv[3])) {
        for(var i in obj.args) {
          console.log(obj.args[i]);
          if(typeof(obj.args[i])=='string') {
            console.log(obj.args[i].substring(0, '_function_'.length));
            if(obj.args[i].substring(0, '_function_'.length)=='_function_') {
              argList.push((function(id) {
                return function() {
                  var argList = [];
                  for(var j=0; j<arguments.length; j++) {
                    argList.push(arguments[j]);
                  }
                  var resObj = {
                    callback: id.substring('_function_'.length),
                    args: argList
                  };
                  console.log('writing back');
                  console.log(resObj);
                  conn.write(JSON.stringify(resObj));
                }
              })(obj.args[i]));
            } else {
              argList.push(obj.args[i].substring('_string_'.length));
            }
          } else {
            argList.push(obj.args[i]);
          }
        }
        console.log('apply', argList);
        try {
          modules[obj.module][obj.method].apply(null, argList);
        } catch(exc) {
          var error = {};
          if(typeof(exc) === 'object' && exc instanceof Error) {
            error.message = exc.message;
            error.stack = exc.stack;
          } else {
            error = exc;
          }
          conn.write(JSON.stringify({ error: error }));
        };
        return;
      }
      conn.write(JSON.stringify({
        type: 'binary',
        unparseable: chunk
      }));
    });
  });
  sockServer.installHandlers(httpsServer, {
    prefix: '/sock'
  });
  console.log('up');

  var modules = {},
    moduleNames = fs.readdirSync('./modules/');
  console.log(moduleNames);
  for(var i=0; i<moduleNames.length; i++) {
    var moduleName = moduleNames[i].substring(0, moduleNames[i].length-3);
    console.log(moduleName);
    modules[moduleName] = require('./modules/'+moduleName);
  }
}
