var should = require('should');
var _ = require('underscore');

var RESOURCES = require('./fixture/weblit-resources.json');

var db = require('./db');
var WeblitResource = require('../').module('./model/weblit-resource');

describe('WeblitResource (with fixture data)', function() {
  beforeEach(db.wipe);
  beforeEach(db.loadFixture(RESOURCES));

  it('should read fixture data', function(done) {
    WeblitResource.findOne({
      title: "Using CSS Text-Shadow to Create Cool Text Effects"
    }, function(err, resource) {
      if (err) return done(err);
      resource.username.should.eql('chadsansing');
      resource.likes[0].username.should.eql('michelle');
      resource.tags[0].should.eql('weblit-Exploring');
      done();
    });
  });

  it('should raise a fucking duplicate key error', function(done) {
    var resource = new WeblitResource({url: RESOURCES[0].url});
    resource.save(function(err) {
      err.code.should.equal(11000);
      done();
    });
  });

  it('should find tagged resources', function() {
    RESOURCES[1].title.should.eql("'deleted' entry");
    WeblitResource.findTagged(function(err, tagged) {
      if (err) return done(err);
      tagged.length.should.be.above(0);
      tagged.forEach(function(r) {
        r.title.should.not.eql(RESOURCES[1].title);
      });
    });
  });
});

describe('WeblitResource (when saved)', function() {
  beforeEach(db.wipe);

  it('should convert email to emailHash', function(done) {
    // http://en.gravatar.com/site/implement/hash/
    var resource = new WeblitResource({
      url: 'http://example.org',
      email: 'MyEmailAddress@example.com '
    });
    resource.save(function(err, resource) {
      if (err) return done(err);
      resource.emailHash.should.eql('0bc83cb571cd1c50ba6f3e8a78ef1346');
      done();
    });
  });

  it('should convert email to emailHash in likes', function(done) {
    var resource = new WeblitResource({
      url: 'http://example.org',
      likes: [{
        username: 'foo',
        email: 'MyEmailAddress@example.com '
      }]
    });
    resource.save(function(err, resource) {
      if (err) return done(err);
      resource.likes[0].emailHash
        .should.eql('0bc83cb571cd1c50ba6f3e8a78ef1346');
      done();
    });
  });
});

describe('WeblitResource (without being saved)', function() {
  it('should represent itself as public JSON', function() {
    var r = new WeblitResource({
      url: 'http://example.org',
      email: 'foo@example.org',
      emailHash: 'foohash',
      title: 'hello',
      likes: [{
        username: 'bar',
        email: 'bar@example.org',
        emailHash: 'barhash'
      }]
    });
    var publicR = r.toPublicJSON();

    publicR.id.should.be.a('string');
    publicR.createdAt.should.be.a('string');
    _.omit(publicR, 'createdAt', 'id').should.eql({
      title: 'hello',
      url: 'http://example.org',
      emailHash: 'foohash',
      tags: [],
      likes: [{
        username: 'bar',
        emailHash: 'barhash'
      }]      
    });
  });

  it('should be likeable', function() {
    var r = new WeblitResource({url: 'http://example.org'});

    r.likes.length.should.eql(0);
    r.like('foo', 'foo@bar.org');
    r.likes.length.should.eql(1);
    r.like('foo', 'foo@bar.org');
    r.likes.length.should.eql(1);
  });

  it('should be unlikeable', function() {
    var r = new WeblitResource({
      url: 'http://example.org',
      likes: [{
        username: 'foo',
        email: 'foo@bar.org'
      }]
    });

    r.likes.length.should.eql(1);
    r.unlike('foo');
    r.likes.length.should.eql(0);
    r.unlike('foo');
    r.likes.length.should.eql(0);
  });
});
