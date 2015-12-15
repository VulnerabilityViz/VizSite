var mongoose = require('mongoose'),
    Model = require('./models/data'),
    Data = mongoose.model('Data'),
    config = require('./config/index.js'),
    fs = require('fs'),
    readline = require('readline'),
    async = require('async'),
    jsonfile = require('jsonfile');

//mongoose.set('debug', true);
/*
var counter = 0;
var currYear = 2005;
var endYear = 2015;

var ubuntuChildren = [];
var debianChildren = [];
var fedoraChildren = [];

var bigData = {
  name : 'CVE',
  children : [
    {
      name : 'ubuntu',
      children : ubuntuChildren
    },
    {
      name : 'debian',
      children : debianChildren
    },
    {
      name : 'fedora',
      children : fedoraChildren
    }
  ]
};

//10067012

async.waterfall([
  function(d) { // connect to database
    mongoose.connect(config.db.url, config.db.options);
    d();
  },
  function(d) { // query the db for fedora
    currYear = 2005;
    async.whilst(
      function() { return currYear < endYear; },
      function(cb) {
        console.log('[Info] Loading year ' + currYear + ' for Fedora');
        currYear++;
        Data.find({
          distro : 'fedora',
          date : {
            $gte : new Date(currYear, 0, 1),
            $lt : new Date(currYear + 1, 0, 1)
          }
        }, 'source cve_list', function(err, docs) {
          if (err) {
            console.log('Oops');
          }
          var yearlyCount = 0;
          docs.forEach(function(doc) {
            yearlyCount += doc.cve_list.length;
          });
          var currYearStat = {
            name : currYear.toString(),
            size : yearlyCount
          };
          fedoraChildren.push(currYearStat);
          cb(); // call the cb for next year
        });
      },
      function(err) {
        d(err);
      }
    );
  },
  function(d) { // query the db for debian
    currYear = 2005;
    async.whilst(
      function() { return currYear < endYear; },
      function(cb) {
        console.log('[Info] Loading year ' + currYear + ' for Debian');
        currYear++;
        Data.find({
          distro : 'debian',
          date : {
            $gte : new Date(currYear, 0, 1),
            $lt : new Date(currYear + 1, 0, 1)
          }
        }, 'source cve_list', function(err, docs) {
          if (err) {
            console.log('Oops');
          }
          var yearlyCount = 0;
          docs.forEach(function(doc) {
            yearlyCount += doc.cve_list.length;
          });
          var currYearStat = {
            name : currYear.toString(),
            size : yearlyCount
          };
          debianChildren.push(currYearStat);
          cb(); // call the cb for next year
        });
      },
      function(err) {
        d(err);
      }
    );
  },
  function(d) { // query the db for ubuntu
    currYear = 2005
    async.whilst(
      function() { return currYear < endYear; },
      function(cb) {
        console.log('[Info] Loading year ' + currYear + ' for Ubuntu');
        currYear++;
        Data.find({
          distro : 'ubuntu',
          date : {
            $gte : new Date(currYear, 0, 1),
            $lt : new Date(currYear + 1, 0, 1)
          }
        }, 'source cve_list', function(err, docs) {
          if (err) {
            console.log('Oops');
          }
          var yearlyCount = 0;
          docs.forEach(function(doc) {
            yearlyCount += doc.cve_list.length;
          });
          var currYearStat = {
            name : currYear.toString(),
            size : yearlyCount
          };
          ubuntuChildren.push(currYearStat);
          cb(); // call the cb for next year
        });
      },
      function(err) {
        d(err);
      }
    );
  }
], function(err, result) {
  console.log('[Info] Finished Query');
  if (err) {
    console.log(err);
  } else {
    //console.log(result);
    console.log('[Info] Done');
  }
  jsonfile.writeFile('./testOut.json', bigData, {spaces : 2}, function(err) {
    console.log('Writing to disk with error: ' + err);
  });
  mongoose.connection.close();
});

*/


/*
([{ $project : {year : {$year : "$date"}, urgency : '$urgency', num_cve : {$size : '$cve_list'}}},
{$group : { _id : { year: "$year", urgency : "$urgency", num_cve : "$num_cve" }, number : {$sum : 1}}} ])
*/


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
