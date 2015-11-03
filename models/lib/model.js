'use strict';

/**
 * @file Defines the properties for the Base schema
 * @name Model
 * @module lib/model
*/

/**
 * @callback getObjectCallback
 * @param {Object} error - The error object if an error occured, null otherwise
 * @param {Model} model - The model object
*/

/*
 * Module dependencies 
*/
var mongoose = require('mongoose');

var Base = new mongoose.Schema({
});

Base.statics = {
  /**
   * Returns the id of the object regardless of if an id or object is passed in or not
   * @name getId
   * @static
   * @method
   * @param {(ObjectId|Model)} input - The ObjectId or Object itself
  */
  getId : function(input) {
    if (!input) {
      return null;
    } else if (input.constructor.name === 'model') {
      return input._id;
    } else if (/^[a-fA-F0-9]{24}$/.test(input)) {
      return input;
    } else {
      return null;
    }
  },
  /**
   * Obtains an object regardless of if an id or object is passed in or not
   * @name getObject
   * @static
   * @method
   * @param {(ObjectId|Model)} input - The ObjectId or Object itself
   * @param {getObjectCallback} cb - The callback that handles the response
  */
  getObject : function(input, cb) {
    var _this = this;
    if (!input) {
      cb('Invalid ' + this.modelName + ' Object', null);
    } else if (input.constructor.name === 'model') {
      cb(null, input);
    } else if (/^[a-fA-F0-9]{24}$/.test(input)) {
      this.findOne(
        { _id : input }
      ).exec(function(err, obj) {
        if (obj) {
          cb(err, obj);
        } else {
          cb('Invalid ' + _this.modelName + ' Object', null);
        }
      });
    } else {
      cb('Invalid ' + this.modelName + ' Object', null);
    }
  },
};

module.exports = Base;