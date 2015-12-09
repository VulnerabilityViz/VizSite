'use strict'
/*
	 source, version, upstream_version, branch, urgency, date, 
	 previous_source, previous_version, cve_list, maintainer, comments
*/
require('mongoose-schema-extend');
var BaseModel = require('./lib/model'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    utils = require('./lib/utils'),
    async = require('async');


var DataSchema = BaseModel.extend({
  distro: {
    type : String,
    require : true
  },
	source: {
    type : String
  }, 
  version: {
    type : String
  },
  upstream_version : {
    type : String
  },
  branch : {
    type : String
  },
  urgency : {
    type : String
  },
  date : {
    type : Date
  },
  previous_source : {
    type : String
  },
  previous_version: {
    type : String
  },
  cve_list : [{
    cve : {
      type : String
    }
  }], 
  maintainer : {
    type : String
  },
  comments : {
    type : String
  }
});

var Data = mongoose.model('Data', DataSchema);
