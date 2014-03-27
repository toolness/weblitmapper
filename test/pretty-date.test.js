var should = require('should');

var prettyDate = require('../').prettyDate;

describe('prettyDate()', function() {
  it('should work for "just now"', function() {
    prettyDate(new Date(Date.now() - 100)).should.eql('just now');
  });

  it('should work for "1 week ago"', function() {
    prettyDate(Date.now() - 1000*60*60*24*7).should.eql('1 week ago');
  });

  it('should work for "2 weeks ago"', function() {
    prettyDate(Date.now() - 1000*60*60*24*7*2).should.eql('2 weeks ago');
  });

  it('should work for a really long time ago', function() {
    prettyDate(new Date(0)).should.eql('on 1 January 1970');
  });
});
