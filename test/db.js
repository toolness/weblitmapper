var assert = require('assert');

var db = Object.create(require('../').db);

assert(!db.wipe);

db.wipe = function(cb) {
  function wipe() {
    db.db.dropDatabase(cb);
  }

  // http://mongoosejs.com/docs/api.html#connection_Connection-readyState
  db.readyState == 2 ? db.on('open', wipe) : wipe();
};

module.exports = db;
