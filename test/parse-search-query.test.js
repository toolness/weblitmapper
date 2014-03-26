var should = require('should');

var parse = require('../').parseSearchQuery;

describe('parseSearchQuery()', function() {
  it('should search for everything by default', function() {
    parse('').should.eql({});
  });

  it('should convert hashtags to weblit tags', function() {
    parse('#explor #build').should.eql({
      tags: ['Exploring', 'Building']
    });
  });

  it('should match hashtags to weblit category names too', function() {
    parse('#scripting').should.eql({
      tags: ['Coding']
    });
  });

  it('should ignore nonsensical hashtags', function() {
    parse('#lolwut').should.eql({});
  });

  it('should recognize namespaced hashtags', function() {
    parse('#weblit-exploring').should.eql({
      tags: ['Exploring']
    });
  });
});

describe('parseSearchQuery.namespace()', function() {
  it('should search for tagPrefix when no tags are provided', function() {
    parse.namespace({}).should.eql({tagPrefix: 'weblit-'});
  });

  it('should prefix tag names', function() {
    parse.namespace({tags: ['Exploring', 'Building']}).should.eql({
      tags: ['weblit-Exploring', 'weblit-Building']
    });
  });
});
