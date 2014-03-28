var fs = require('fs');
var should = require('should');

var writeBundle = require('../').writeBundle;

describe('writeBundle()', function() {
  it('should not explode', function(done) {
    if (fs.existsSync(writeBundle.PATH)) fs.unlinkSync(writeBundle.PATH);
    writeBundle({writeToFile: true}).on('end', function() {
      fs.existsSync(writeBundle.PATH).should.be.true;
      done();
    });
  });
});
