var fs = require('fs');
var assert = require('assert');
var Writable = require('stream').Writable;
var util = require('util');
var async = require('async');
var JSONStream = require('JSONStream');
var _ = require('underscore');

var allModels = require('../').model.all;
var db = Object.create(require('../').db);

function importModel(info, cb) {
  var modelConstructor = db.models[info.model];
  if (!modelConstructor)
    return cb(new Error("unknown model: " + info.model));
  var model = new modelConstructor(_.omit(info, 'model'));
  model.save(cb);
}

function ImportModelStream() {
  Writable.call(this, {objectMode: true});

  // This will ensure all models are registered with the DB.
  allModels();
}

util.inherits(ImportModelStream, Writable);

ImportModelStream.prototype._write = function(data, encoding, cb) {
  importModel(data, cb);
}

assert(!db.wipe);

db.wipe = function(cb) {
  function wipe() {
    db.db.dropDatabase(function(err) {
      if (err) return cb(err);
      async.each(allModels(), function(model, cb) {
        model.ensureIndexes(cb);
      }, cb);
    });
  }

  // http://mongoosejs.com/docs/api.html#connection_Connection-readyState
  db.readyState == 2 ? db.on('open', wipe) : wipe();
};

db.loadFixture = function(models, cb) {
  function loadFixture(cb) {
    if (typeof(models) == 'string') {
      return fs.createReadStream(models)
        .pipe(JSONStream.parse('*'))
        .pipe(new ImportModelStream())
        .on('error', cb)
        .on('finish', cb);;
    }
    async.each(models, importModel, cb);
  }

  return cb ? loadFixture(cb) : loadFixture;
};

module.exports = db;
