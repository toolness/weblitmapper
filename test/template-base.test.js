var should = require('should');
var nunjucks = require('nunjucks');

var env = require('../').templateBase.buildEnvironment(nunjucks, []);

describe('simplifyUrl template filter', function() {
  var simplifyUrl = env.filters.simplifyUrl;

  it('should simplify to just domain names', function() {
    simplifyUrl('http://foo.org/').should.eql('foo.org');
  });

  it('should simplify to domain names with paths', function() {
    simplifyUrl('http://foo.org/bop?lol').should.eql('foo.org/bop');
  });
});
