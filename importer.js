var mongoose = require('mongoose'),
    Model = require('./models/data'),
    Data = mongoose.model('Data'),
    config = require('./config/index.js'),
    fs = require('fs'),
    readline = require('readline'),
    async = require('async'),
    csvjson = require('csvjson');

var distro = 'ubuntu';
var counter = 0;

mongoose.connect(config.db.url, config.db.options);

var bigData = csvjson.toObject('/data/parsed_changelogs/' + distro + '.csv').output;
console.log('[Info] Loaded table into memory');

async.mapSeries(bigData, function(item, d) {
  item.date = new Date(item.date);
  item.cve_list = item.cve_list.split(';');
  item.distro = distro;
  if (isNaN( item.date.getTime() )) {
    delete item.date;
  }
  var curr = new Data(item);
  curr.save(function(err) {
    counter++;
    console.log('[Info] #' + counter + ' saved: ' + item.source + ' - ' + item.version);
    d(err);
  });
}, function(err) {
  if (err) {
    console.log('[Shit\'s on fire] ' + err);
  } else {
    console.log('[Done]');
  }
  console.log('[Info] Closing DB');
  mongoose.connection.close();
});


/*
reader.on('line', function(line) {
  var cols = line.split(',');
  var curr = { 
    distro : distro,
    source : cols[0],
    version : cols[1],
    upstream_version : cols[2],
    branch : cols[3],
    urgency : cols[4],
    date : new Date(cols[5]),
    previous_source : cols[6],
    previous_version : cols[7],
    cve_list : cols[8].split(';'),
    maintainer : cols[9],
    comments : cols[10]
  };
  if (isNaN( curr.date.getTime() )) {
    curr.date = null;
  }

  fullData.push(curr);

}).on('close', function() {
  importData(fullData);
});
*/
