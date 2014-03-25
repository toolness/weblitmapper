var should = require('should');

var prettyDate = require('../').prettyDate;

describe('prettyDate()', function() {
  it('should work for "just now"', function() {
    prettyDate(new Date(Date.now() - 100)).should.eql('just now');
  });

  it('should work for a really long time ago', function() {
    prettyDate(new Date(0)).should.eql('on 1 January 1970');
  });
});
