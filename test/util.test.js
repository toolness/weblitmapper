var should = require('should');
var util = require('../').util;

describe('util.squishName()', function() {
  var squishName = util.squishName;

  it('should ignore non-alphanumerics', function() {
    squishName('lol?').should.eql('lol');
    squishName('contact 1').should.eql('contact1');
  });

  it('should lowercase', function() {
    squishName('Name of Organization').should.eql('nameoforganization');
  });
});

describe('util.doesEmailMatch()', function() {
  var doesEmailMatch = util.doesEmailMatch;

  it('should work w/ comma-separated values', function() {
    doesEmailMatch('foo@example.org', 'a@b.org, foo@example.org')
      .should.be.true;
  });

  it('should return false when nothing matches', function() {
    doesEmailMatch('foo@example.org', 'bar@example.org')
      .should.be.false;
  });

  it('should return false when given empty list', function() {
    doesEmailMatch('foo@example.org', '')
      .should.be.false;
  });

  it('should be case-insensitive', function() {
    doesEmailMatch('fOo@example.org', 'FOO@example.org')
      .should.be.true;    
  });

  it('should work w/ "anyone" wildcard', function() {
    doesEmailMatch('foo@example.org', 'anyone@example.org')
      .should.be.true;
  });
});