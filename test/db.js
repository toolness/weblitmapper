var assert = require('assert');
var fs = require('fs');
var async = require('async');
var _ = require('underscore');

var db = Object.create(require('../').db);

function loadAllModels() {
  fs.readdirSync(__dirname + '/../lib/model').forEach(function(filename) {
    require('../').module('./model/' + filename);
  });
}

assert(!db.wipe);

db.wipe = function(cb) {
  function wipe() {
    db.db.dropDatabase(function(err) {
      if (err) return cb(err);
      async.each(Object.keys(db.models), function(modelName, cb) {
        db.models[modelName].ensureIndexes(cb);
      }, cb);
    });
  }

  // http://mongoosejs.com/docs/api.html#connection_Connection-readyState
  db.readyState == 2 ? db.on('open', wipe) : wipe();
};

db.loadFixture = function(models, cb) {
  function loadFixture(cb) {
    async.each(models, function(info, cb) {
      var modelConstructor = db.models[info.model];
      if (!modelConstructor)
        return cb(new Error("unknown model: " + info.model));
      var model = new modelConstructor(_.omit(info, 'model'));
      model.save(cb);
    }, cb);
  }

  return cb ? loadFixture(cb) : loadFixture;
};

loadAllModels();

module.exports = db;
