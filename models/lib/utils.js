var async = require('async'),
    mongoose = require('mongoose');

/*
 * Franz's badass data validation function
 * values param = the input data
 * checks param = the validation template
 * cb param = the callback
 */
module.exports.validate = function validate(values, checks, cb) {
  var checkValue = function(value, type, d) {
    if (type === Object) {
      d();
    } else if (value.constructor === type) {
      d();
    } else if (type.modelName) {
      var Model = mongoose.model(type.modelName);
      Model.count({
        _id  : Model.checkId(value)
      }).exec(function(err, count) {
        if (count === 1) {
          d();
        } else {
          d(value + ' is not a ' + type.modelName);
        }
      });
    } else {
      d(value + ' is not a ' + (type.name || type));
    }
  };
 
  var processValue = function(value, type, d) {
    if (type.constructor === Object) {
      validate(value, type, d);
    } else if (type.constructor === Array) {
      if (type.length !== 1) {
        d('Can only validate using arrays of length 1');
      } else if (!Array.isArray(value)) {
        d(value + ' is not a Array');
      } else {
        async.map(value, function(val, c) {
          checkValue(val, type[0], c);
        }, function(err) {
          d(err);
        });
      }
    } else {
      checkValue(value, type, d);
    }
  };
 
  if (!values || !checks) {
    cb('Input and validation type mismatch');
  } else if (values.constructor === Object && checks.constructor === Object) {
    async.map(Object.keys(checks), function(key, d) {
      var value = values[key];
      if (value !== null && value !== undefined) {
        processValue(value, checks[key], d);
      } else {
        d(key + ' is not present');
      }
    }, function(err) {
      cb(err);
    });
  } else if (Array.isArray(values) && Array.isArray(checks)) {
    if (checks.length !== 1) {
      cb('Can only validate using arrays of length 1');
    } else {
      var type = checks[0];
      async.map(values, function(value, d) {
        if (value !== null && value !== undefined) {
          processValue(value, type, d);
        } else {
          d(value + ' found in Array');
        }
      }, function(err) {
        cb(err);
      });
    }
  } else {
    cb('Input and validation type mismatch');
  }
};

