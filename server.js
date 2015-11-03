/*
 * Dependencies
 */
var express = require('express'),
  logger = require('morgan'),
  favicon = require('serve-favicon'),
  mongoose = require('mongoose'),
  passport = require('passport'),
  expressSession = require('express-session'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  config = require('./config/index.js'),
  LocalStrategy = require('passport-local').Strategy,
  fs = require('fs'),
  MongoStore = require('connect-mongo')(expressSession);
/*
 *  * Connect to Mongo DB
 *   */
var connect = function () {
    mongoose.connect(config.db.url, config.db.options);
};
connect();

mongoose.connection.on('error', console.log);
mongoose.connection.on('disconnect', connect); // auto reconnect on disconnect :)

/*
 * Load Models and Connect to MongoDB
 */
fs.readdirSync('./models').forEach(function(file) {
  if (file.substr(-3) === '.js') {
    require('./models/' + file);
  }
});

/*
 * Passport Authentication
 */
require('./config/passport')(passport);
/*
 * Create express server
 */
var app = express();
// Mongo Store for persistent sessions
var myStore = new MongoStore({
  url : config.db.url,
  mongoOptions : config.db.options,
  collection : config.session.collection
});
/* 
 * Express configs
 */
app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended  : true }));
app.use(cookieParser()); // read cookies (needed for auth)
app.use(favicon(__dirname + '/public/img/favicon.png'));
// Express/Mongo session Storage
app.use(expressSession({ 
  secret : config.session.secret, 
  store : myStore,
  cookie : config.session.cookie,
  name :  config.session.name,
  resave : true,
  saveUninitialized : true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

/*
 * Controllers - routes
 */
require('./controllers/index')(app, passport);


/* 
 * Static Routes
 */
app.use('/static/lib/', express.static(__dirname + '/bower_components'));
app.use('/static/', express.static(__dirname + '/public/'));

/*
 * Start express server
 */
var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});
// Pass the session store to socket IO for authenticated sockets
server.sessionStorage = myStore;
/*
 * Bootstrap Socket.io
 */
var io = require('./socket/index').listen(server);

/*
// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message : err.message,
        error : {}
    });
});
*/
