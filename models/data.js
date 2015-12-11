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
    require : true,
    index : true
  },
	source: {
    type : String,
    index : true
  }, 
  version: {
    type : String,
    index : true
  },
  branch : {
    type : String
  },
  urgency : {
    type : String
  },
  date : {
    type : Date,
    index : true
  },
  cve_list : [{
    type : String
  }], 
  maintainer : {
    type : String
  }
});

var Data = mongoose.model('Data', DataSchema);
