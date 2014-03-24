var through = require('through');

var writeBundle = require('../bin/write-bundle');

describe('writeBundle()', function() {
  it('should not explode', function(done) {
    writeBundle(through(function(data) {
      this.queue(data);
    }, function() {
      done();
    }));
  });
});
