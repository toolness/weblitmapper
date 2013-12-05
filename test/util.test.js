var should = require('should');
var util = require('../').util;

describe('util.getUsername(', function() {
  var getUsername = util.getUsername;

  it('should parse @username', function() {
    getUsername('@username').should.eql('username');
  });

  it('should parse http://mysite.com/username', function() {
    getUsername('http://mysite.com/username').should.eql('username');
  });

  it('should parse username', function() {
    getUsername('username').should.eql('username');
  });

  it('should parse mysite.com/username', function() {
    getUsername('mysite.com/username').should.eql('username');
  });

  it('should parse mysite.com/username/', function() {
    getUsername('mysite.com/username/').should.eql('username');
  });

  it('should parse mysite.com/#!username', function() {
    getUsername('mysite.com/#!username').should.eql('username');
  });
});

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

describe('util.getDomain()', function() {
  var getDomain = util.getDomain;

  it('should work w/ URLs that have no protocol', function() {
    getDomain('foo.org/blah').should.eql('foo.org');
  });

  it('should work w/ URLs that have a protocol', function() {
    getDomain('http://foo.org/blah').should.eql('foo.org');
  });

  it('should work w/ empty strings', function() {
    getDomain('').should.eql('');
  });
});

describe('util.normalizeURL()', function() {
  var normalizeURL = util.normalizeURL;

  it('should add http:\/\/ to URLs w/o protocols', function() {
    normalizeURL('example.org').should.eql('http://example.org');
  });

  it('should return http URLs unmodified', function() {
    normalizeURL('http://example.org').should.eql('http://example.org');
  });

  it('should return https URLs unmodified', function() {
    normalizeURL('https://example.org').should.eql('https://example.org');
  });

  it('should work w/ empty strings', function() {
    normalizeURL('').should.eql('http://');
  });
});
