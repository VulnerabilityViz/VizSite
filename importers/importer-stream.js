var mongoose = require('mongoose'),
    Model = require('../models/data'),
    Data = mongoose.model('Data'),
    config = require('../config/index.js'),
    fs = require('fs'),
    readline = require('readline'),
    async = require('async'),
    csvstream = require('csv-stream');

mongoose.connect(config.db.url, config.db.options);

var distro = 'ubuntu';
var counter = 0;

var csvStream = csvstream.createStream();

var rstream = fs.createReadStream('/data/parsed_changelogs/' + distro + '.csv');
rstream.pipe(csvStream).on('data', function(item) {
  item.date = new Date(item.date);
  item.cve_list = item.cve_list.split(';');
  item.distro = distro;
  if (isNaN( item.date.getTime() )) {
    delete item.date;
  }
  var curr = new Data(item);
  curr.save(function(err) {
    counter++;
    if (err) {
      console.log('[Error] #' + counter + ' for: ' + item.source + ' - ' + item.version + ' Error message: ' + err);
    } else {
      console.log('[Info] #' + counter + ' saved: ' + item.source + ' - ' + item.version);
    }
  });

}).on('end', function() {
  console.log('[Info] Finished reading data');
});
