var async = require('async');
var db = require('../lib/db');
var allModels = require('../lib/model').all;

function ensureIndexes(model, cb) {
  console.log('Ensuring indexes on ' + model.modelName + '.');
  model.ensureIndexes(cb);
}

function reSaveDocuments(model, cb) {
  var ids = [];

  model.find({}).stream().on('data', function(data) {
    ids.push(data.id);
  }).on('end', function() {
    console.log('Re-saving ' + ids.length + ' ' + model.modelName +
                ' documents.');
    async.eachSeries(ids, function(id, cb) {
      model.findOne({_id: id}, function(err, data) {
        if (err) return cb(err);
        if (!data) return cb(new Error("id " + id + " not found"));
        data.save(cb);
      });
    }, cb);
  });
}

async.eachSeries(allModels(), function(model, cb) {
  async.applyEachSeries([
    reSaveDocuments,
    ensureIndexes
  ], model, cb);
}, function(err) {
  if (err) throw err;
  console.log('Done.');
  db.close();
});
