var LocalStrategy = require('passport-local').Strategy,
    mongoose = require('mongoose'), 
    User = mongoose.model('User'); // User model that's registered in models/user

// expose this function to the main server.js using module.exports
module.exports = function(passport) {
  // passport session setup
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session

  // used to serialize the user for the session
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  // Local SIGNUP logic
  
  passport.use('local-signup', new LocalStrategy({
    usernameField : 'username', 
    passwordField : 'password',
    passReqToCallback : true // allows to pass back the entire request to the callback
  }, 
  function(req, username, password, done) {
    if ( typeof username === 'string' && typeof password === 'string' ) {
      // async
      // User.findOne won't fire unless data is sent back
      process.nextTick(function() {
        // find a user of matching username
        // check if user exists already
        User.findOne({ 'username' : username.toLowerCase() }, function (err, user) {
          if (err) { return done(err); }
          // if user already exists
          if (user) {
            return done(null, false);
          } else { // user not already registered
            var newUser = new User();
            newUser.username = username.toLowerCase();
            newUser.password = password;
            newUser.fullname = req.body.fullname;
            newUser.role = req.body.role;
            //save the user
            newUser.save(function(err) {
              if (err) { throw err; }
              return done(null, newUser);
            });
          }
        });
      });
    } else {
      return done(null, false);
    }
  }));

  passport.use('local-login', new LocalStrategy({
    usernameField : 'username',
    passwordField : 'password',
    passReqToCallback : true
  }, 
  function(req, username, password, done) {
    if ( typeof username === 'string' && typeof password === 'string' ) {
      User.findOne({ 'username' : username.toLowerCase() }, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        if (!user.validPassword(password)) { return done(null, false); }
        return done(null, user);
      });
    } else {
      return done(null, false);
    }
  }));

};// end module export
