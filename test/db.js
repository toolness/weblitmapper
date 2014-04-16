var assert = require('assert');
var async = require('async');
var _ = require('underscore');

var db = Object.create(require('../').db);
var WeblitResource = require('../').module('./model/weblit-resource');

assert(!db.wipe);

db.wipe = function(cb) {
  function wipe() {
    db.db.dropDatabase(function(err) {
      if (err) return cb(err);
      WeblitResource.ensureIndexes(cb);
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

module.exports = db;
