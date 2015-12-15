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

DataSchema.index({distro: 1, date: 1 });
DataSchema.index({distro: 1, source: 1 });


DataSchema.statics = {
  processBigData : function(cb) {
    async.waterfall([
      function(d) {
        console.log('[Info] Begin big data aggregation');
        Data.aggregate({ 
          $unwind : '$cve_list'
        },
        {
          $match : {
            cve_list : {
              $ne : ''
            }
          }
        },
        {
          $project : {
            year : {
              $year : '$date'
            },
            urgency : '$urgency',
            distro : '$distro'
          }
        },
        {
          $group : {
            _id : {
              year : '$year',
              urgency : '$urgency',
              num_cve : '$num_cve',
              distro : '$distro'
            },
            number : {
              $sum : 1
            }
          }
        }).allowDiskUse(true).exec(d);
      },
      function(obj, d) {
        console.log('[Info] Making the data easier');
        var TOTALCVE = 0;
        var years = {};
        obj.forEach(function(item) {
          var currYear = item._id.year.toString();
          var currDistro = item._id.distro;
          var currCVENum = item.number;
          var currUrgency = item._id.urgency
          if (!currUrgency) {
            currUrgency = 'unknown';
          }
          if (!years[currYear]) {
            // make the year
            years[currYear] = {};
          }
          if (!years[currYear][currDistro]) {
            // make the distro in year
            years[currYear][currDistro] = {};
          }
           if (!years[currYear][currDistro][currUrgency]) {
            // make the urgency in distro in year
            years[currYear][currDistro][currUrgency] = {};
          }
          if (!years[currYear][currDistro][currUrgency]['cve']) {
            years[currYear][currDistro][currUrgency]['cve'] = currCVENum;
          } else {
            years[currYear][currDistro][currUrgency]['cve'] += currCVENum;
          }
          TOTALCVE += currCVENum;
        });
        d(null, years);
      },
      function(years, d) {
        console.log('[Info] Transforming into the D3 format');
        var output = {
          name : '',
          children : []
        };
        var yearsSort = Object.keys(years).sort();
        yearsSort.forEach(function(year) {
          var currYear = years[year];
          var currYearHash = {
            name : year,
            children : []
          };
          output.children.push(currYearHash);
          var distroSort = Object.keys(currYear).sort();
          distroSort.forEach(function(distro) {
            var currDistro = currYear[distro];
            var currDistroHash = {
              name : distro,
              children : []
            };
            currYearHash.children.push(currDistroHash);
            var urgencySort = Object.keys(currDistro).sort();
            urgencySort.forEach(function(urg) {
              var currUrg = currDistro[urg];
              var currUrgHash = {
                name : urg,
                children : [{
                  name : currUrg.cve.toString() + ' CVEs',
                  size : currUrg.cve
                }]
              };
              currDistroHash.children.push(currUrgHash);
            });
          });
        });
        d(null, output);
      }
    ], function(err, result) {
      console.log('Done Processing');
      cb(err, result); 
    });
  }
};


var Data = mongoose.model('Data', DataSchema);
