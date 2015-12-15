var mongoose = require('mongoose'),
    Model = require('./models/data'),
    Data = mongoose.model('Data'),
    config = require('./config/index.js'),
    fs = require('fs'),
    readline = require('readline'),
    async = require('async'),
    jsonfile = require('jsonfile');

async.waterfall([
  function(d) {
    mongoose.connect(config.db.url, config.db.options);
    d();
  },
  function(d) {
    console.log('[Info] Begin aggregation');
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
  }
], function(err, result) {
  if (err) {
    console.log('[Error] occurred: ' + err);
  } else {
    console.log('[Info] Done');
    jsonfile.writeFile('./temp2.json', result, {spaces : 2}, function(err) {
      console.log('Writing to disk with error: ' + err);
    });
  }
  mongoose.connection.close(); // done with the connection
});
