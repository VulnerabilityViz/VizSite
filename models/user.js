var mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs'),
    passportLocalMongoose = require('passport-local-mongoose'),
    utils = require('./lib/utils');
    async = require('async');

var SALT_FACTOR = 8;

var userSchema = new mongoose.Schema({
  username : { 
    type : String,
    unique : true,
    required : true
  },
  password : { 
    type : String,
    required : true
  },
  fullname : {
    type : String,
    required : true
  },
  role : {
    type : String,
    required : true
  }
});


// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(SALT_FACTOR), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

// hash password before saving account
userSchema.pre('save', function(next) {
  var user = this;
  // if user password hasn't been modified, don't do anything
  if (!user.isModified('password')) return next();

  bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});
userSchema.statics = { 
  updatePassword : function(socket, data, cb) {
    if (socket.request.user._id === null) { // almost impossible, just in case
      cb('unauthed user'); // go away...
    } else {
      async.waterfall([
        // validate data
        function(d) {
          utils.validate(data, {
            oldPassword : String,
            newPassword : String,
            newConfirmPassword : String
          }, d);
        },
        // find current user in the db
        function(d) {
          User.findOne({
            _id : socket.request.user._id
          }, d);
        }, 
        // verify password and save to db
        function(user, d) {
          if(user && user.validPassword(data.oldPassword)) {
            user.password = data.newPassword;
            user.save(d);
          } else {
          d('old password incorrect'); // didn't match send back false
          }
        }
      ], cb);
    }
  },
  getAll : function(cb) {
    User.find({}, 'username fullname role', function(err, all) {
      cb(err, all);
    });
  }
}
// register the model with mongoose
var User = mongoose.model('User', userSchema);
/* Used to create default user
var dataviz = new User({
  username : 'dataviz',
  password : 'a',
  role : 'Admin',
  fullname : 'Admin Person'
});
dataviz.save();
*/
