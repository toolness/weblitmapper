var writeBundle = require('../bin/write-bundle');
var through = require('through');

describe('writeBundle()', function() {
  it('should not explode', function(done) {
    writeBundle(through(function(data) {
      this.queue(data);
    }, function() {
      done();
    }));
  });
});
