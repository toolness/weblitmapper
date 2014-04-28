var should = require('should');

var parse = require('../').parseSearchQuery;

describe('parseSearchQuery()', function() {
  it('should search for everything by default', function() {
    parse('').should.eql({});
  });

  it('should set allText search terms', function() {
    parse('hi there').allText.toString().should.eql('/hi there/i');
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

  it('should recognize user:<username>', function() {
    parse(' user:bop ').should.eql({username: 'bop'});
  });

  it('should convert to mongo query if option is provided', function() {
    parse('', {mongo: true}).should.eql({
      $query: {tags: {$not: {$size: 0}}},
      $orderby: {createdAt: -1}
    });
  });
});

describe('parseSearchQuery.mongo()', function() {
  it('should search for tagged docs when no tags are provided', function() {
    parse.mongo({}).should.eql({
      $query: {tags: {$not: {$size: 0}}},
      $orderby: {createdAt: -1}
    });
  });

  it('should prefix tag names', function() {
    parse.mongo({tags: ['Exploring', 'Building']}).should.eql({
      $query: {tags: {$all: ['weblit-Exploring', 'weblit-Building']}},
      $orderby: {createdAt: -1}
    });
  });
});
