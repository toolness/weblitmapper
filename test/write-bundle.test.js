var through = require('through');

var writeBundle = require('../').writeBundle;

describe('writeBundle()', function() {
  it('should not explode', function(done) {
    writeBundle().pipe(through(function(data) {
      this.queue(data);
    }, function() {
      done();
    }));
  });
});
