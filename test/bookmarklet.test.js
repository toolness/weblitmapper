var should = require('should');

var bookmarklet = require('../').bookmarklet;

describe('bookmarklet', function() {
  it('should work', function() {
    bookmarklet('LOL').should.match(/^javascript:/);
    bookmarklet('LOL').should.match(/LOL\/update/);
  });
});