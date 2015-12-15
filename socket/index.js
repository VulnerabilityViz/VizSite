var socketio = require('socket.io'), 
    passportSocketIO = require('passport.socketio'),
    cookieParser = require('cookie-parser'),
    config = require('../config'),
    fs = require('fs'),
    async = require('async'),
    mongoose = require('mongoose'),
    Data = mongoose.model('Data');

/*
 * app is the express server passed in from server.js
 */
module.exports.listen = function(app) {
  var io = socketio(app);

  // use passport to enable authenticated sockets
  io.use(passportSocketIO.authorize({
    cookieParser : cookieParser,
    secret : config.session.secret,
    key : config.session.name,
    store : app.sessionStorage,
    fail : function(data, message, err, accept) {
      console.log('socket.io authentication failed ' + message);
      accept(null, !err);
    }
  }));
  // load rest of the files in this sockets dir and load them
  fs.readdirSync(__dirname).forEach(function(file) {
    if (file.substr(-3) === '.js' && file != 'index.js') {
      require('./' + file)(io);
    }
  });

  // socket for '/' namespace
  io.on('connection', function(socket) {
    console.log('Client connected to /');
    socket.on('test', function(data) {
      console.log('namespace / :' + data);
    });


    socket.on('Big Data', function() {
      // send back big data
      Data.processBigData(function(err, data) {
        if (err) {
          console.log('[ERROR] Big Data Error');
        } else {
          socket.emit('Big Data', data);
        }
      });
    });
  });

};

module.exports.logError = function(socket, data, name, err) {
  console.error('[ERROR] ' + name + ' error from: ' + socket.handshake.address + 
      ' on ' + (new Date()) + 
      '\n        Socket data: ' + JSON.stringify(data) + 
      '\n        Error: ' + err);
};
