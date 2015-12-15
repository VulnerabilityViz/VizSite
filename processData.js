var jsonfile = require('jsonfile'),
    async = require('async');

var years = {

};

var TOTALCVE = 0;

var output = {
  name : 'CVE Frequency',
  children : []
};

async.waterfall([
  function(d) {
    jsonfile.readFile('./temp2.json', function(err, object) {
      d(err, object);
    }); 
  },
  function(obj, d) {
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
    d();
  },
  function(d) {
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
  jsonfile.writeFile('./idk.json', result, {spaces : 2}, function(err) {
    console.log('Writing to disk with error: ' + err);
  });
  console.log('[Info] Done');
  console.log('[Info] Total Number of CVEs: ' + TOTALCVE);
});

