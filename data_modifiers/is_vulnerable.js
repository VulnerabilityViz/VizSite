var mongoose = require('mongoose'),
    DataModel = require('../models/data'),
    BotSecurityModel = require('../models/botsecurity'),
    Data = mongoose.model('Data'),
    BotSecurity = mongoose.model('BotSecurity'),
    config = require('../config/index.js'),
    fs = require('fs'),
    readline = require('readline'),
    async = require('async'),
    csvstream = require('csv-stream'),
    version_cleaner = require('../data_modifiers/version_clean');

mongoose.connect(config.db.url, config.db.options);

// console.log(version_cleaner.is_vulnerable('1.7.0', '1.9'));

// http://www.tothenew.com/blog/removing-duplicate-elements-from-an-array-using-reduce-method/
Array.prototype.unique= function ()
{
  var r = this.reduce(function(previous, current, index, array)
   {
     previous[current.toString()+typeof(current)]=current;
     return array.length-1 == index ? Object.keys(previous).reduce(function(prev,cur)
       {
          prev.push(previous[cur]);
          return prev;
       },[]) : previous;
   }, {});
  if (Object.keys(r).length == 0) 
    return []; 
  else 
    return r;
};



var distro = 'debian';

// Get all debian vulnerabilities locally to use later
var query = BotSecurity.find({}, 'package fixed_version cve_list');//.limit(100);

query.exec(function(err, docs) {
  if(err) throw err;
  
  // Create a lookup table of:
  // package_name -> version_name -> list of CVEs
  // so that we can get a package and version and get a list of unique CVEs that it is vulnerable to
  fix_lookup = {};
  for (d in docs) {
    if(docs[d].package) {
      if (fix_lookup[docs[d].package] == undefined) {
        fix_lookup[docs[d].package] = {};
      }
      var v = version_cleaner.cleanVersion(docs[d].fixed_version);
      if (v) {
        if (fix_lookup[docs[d].package][v] == undefined)
          fix_lookup[docs[d].package][v] = []
        fix_lookup[docs[d].package][v] = fix_lookup[docs[d].package][v].concat(docs[d].cve_list).unique();
      }
    }
  }

  console.log(fix_lookup);
  console.log("BotSecurity returned " + docs.length + " docs");

  function getCVEs(vCurrent, package_name) {
    vul_versions = fix_lookup[package_name];
    cves = [];
    for (version in vul_versions) {
      var version_cves = vul_versions[version];
      // If the current version is vulnerable to this version..
      if(version_cleaner.is_vulnerable(vCurrent, version)) {
        cves = cves.concat(version_cves);
      }
    }
    return cves.unique();
  }

  // console.log(fix_lookup);

  // Now use a stream to access the changelog data and determine if any data is vulnerable

  var counter = 0;

  var query_stream = Data.find({
    distro: distro,
    source: "gnash" // cheating for speed
  }).stream();

  query_stream.on('data', function(doc) {
    // console.log(fix_lookup[doc.source]);
    var version = version_cleaner.cleanVersion(doc.version);
    // if version cleaned
    if(version) {
      // if this source even has any CVEs on record
      if(fix_lookup[doc.source] != undefined && Object.keys(fix_lookup[doc.source]).length > 0) {
        // Find CVEs that affect this version
        cves = getCVEs(version, doc.source);
        // If any found, print it's vulnerable!
        if(cves.length == 0) {
          console.log(doc.source + " is NOT vulnerable for version " + doc.version + " (parsed into " + version + ") on " + doc.date);
          console.log(cves);
        } else {
          console.log(doc.source + " is vulnerable for version " + doc.version + " (parsed into " + version + ") with " + cves.length + " CVEs on " + doc.date);
          console.log(cves);  

        }
        
        // Add the new data fields
        // doc.parsed_cve_list = cves;
        // doc.is_vulnerable = (cves.length != 0);
        // doc.parsed_version = version;

        // console.log(doc);
        // doc.save(function(err, done) {
        //   counter += 1;
        //   if (counter % 1000 == 0) console.log(counter + " docs updated");
        // });
      }
    }
  });

  query_stream.on('error', function(error) {
    console.log(error);
  });

  query_stream.on('close', function() {
    mongoose.disconnect();
  });

});





// var csvStream = csvstream.createStream({
//   columns : ['cve_list', 'date', 'package', 'type', 'release', 'fixed_version', 'urgency', 'origin', 'bugs']
// });

// var rstream = fs.createReadStream('/data/debian_security_db/bot-table.csv');
// rstream.pipe(csvStream).on('data', function(item) {
//   item.date = new Date(item.date);
//   item.cve_list = item.cve_list.split(';');
//   item.bugs = item.bugs.split(';');
//   item.distro = distro;
//   if (isNaN( item.date.getTime() )) {
//     delete item.date;
//   }
//   // console.log(item);
//   var curr = new BotSecurity(item);
//   // console.log(curr);
//   curr.save(function(err) {
//     counter++;
//     if (err) {
//       console.log('[Error] #' + counter + ' for: ' + item.date + ' - ' + item.fixed_version + ' Error message: ' + err);
//     } else {
//       console.log('[Info] #' + counter + ' saved: ' + item.date + ' - ' + item.fixed_version);
//     }
//   });

// }).on('end', function() {
//   console.log('[Info] Finished reading data');
// });
