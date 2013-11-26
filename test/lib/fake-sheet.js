var sinon = require('sinon');

function makeFakeRow(fields) {
  fields.save = function(cb) {
    process.nextTick(function() {
      cb(null);
    });
  };

  return fields;
}

function FakeSheet(rawRows, updated) {
  var self = {};

  rawRows = JSON.parse(JSON.stringify(rawRows)).map(makeFakeRow);
  self.info = {
    updated: updated || (new Date()).toISOString(),
    worksheets: [{
      id: 'worksheet',
      getRows: sinon.spy(function(cb) {
        process.nextTick(function() {
          cb(null, rawRows);
        });
      })
    }]
  };
  self.rawRows = rawRows;
  self.getInfo = sinon.spy(function(cb) {
    process.nextTick(function() {
      cb(null, self.info);
    });
  });

  return self;
}

module.exports = FakeSheet;
