var mongoose = require('mongoose'),
    Model = require('../models/botsecurity'),
    BotSecurity = mongoose.model('BotSecurity'),
    config = require('../config/index.js'),
    fs = require('fs'),
    readline = require('readline'),
    async = require('async'),
    csvstream = require('csv-stream');

mongoose.connect(config.db.url, config.db.options);

var distro = 'debian';
var counter = 0;

var csvStream = csvstream.createStream({
  columns : ['cve_list', 'date', 'package', 'type', 'release', 'fixed_version', 'urgency', 'origin', 'bugs']
});

var rstream = fs.createReadStream('/data/debian_security_db/bot-table.csv');
rstream.pipe(csvStream).on('data', function(item) {
  item.date = new Date(item.date);
  item.cve_list = item.cve_list.split(';');
  item.bugs = item.bugs.split(';');
  item.distro = distro;
  if (isNaN( item.date.getTime() )) {
    delete item.date;
  }
  // console.log(item);
  var curr = new BotSecurity(item);
  // console.log(curr);
  curr.save(function(err) {
    counter++;
    if (err) {
      console.log('[Error] #' + counter + ' for: ' + item.date + ' - ' + item.fixed_version + ' Error message: ' + err);
    } else {
      console.log('[Info] #' + counter + ' saved: ' + item.date + ' - ' + item.fixed_version);
    }
  });

}).on('end', function() {
  console.log('[Info] Finished reading data');
});
