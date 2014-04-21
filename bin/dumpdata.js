var async = require('async');
var JSONStream = require('JSONStream');

var db = require('../test/db');
var allModels = require('../').model.all;

var output = JSONStream.stringify();

output.pipe(process.stdout);

async.eachSeries(allModels(), function(model, cb) {
  model.find({}).lean().stream().on('data', function(data) {
    data.model = model.modelName;
    output.write(data);
  }).on('error', cb).on('end', cb);
}, function(err) {
  if (err) throw err;

  output.end();
  db.close();
});
