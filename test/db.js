var assert = require('assert');

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

module.exports = db;
