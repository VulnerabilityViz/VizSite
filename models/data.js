'use strict'

require('mongoose-schema-extend');
var BaseModel = require('./lib/model'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    utils = require('./lib/utils'),
    async = require('async');


var DataSchema = BaseModel.extend({
	
});

var Data = mongoose.model('Data', DataSchema);
