'use strict'


require('mongoose-schema-extend');
var BaseModel = require('./lib/model'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    utils = require('./lib/utils'),
    async = require('async');


var BotSecuritySchema = BaseModel.extend({
  distro: {
    type : String,
    require : true,
    index : true
  },
  cve_list : [{
    type : String
  }],
  date : {
    type : Date,
    index : true
  },
  "package": {
    type : String,
    index : true
  },
  type : {
    type : String
  },
  release: {
    type : String
  },
  fixed_version : {
    type : String,
    index: true
  },
  urgency : {
    type : String,
    index: true
  },
  origin : {
    type : String
  },
  bugs : [{
    type : String
  }]
});

var BotSecurity = mongoose.model('BotSecurity', BotSecuritySchema);
