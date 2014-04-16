var should = require('should');

var RESOURCES = require('./fixtures/weblit-resources.json');

var db = require('./db');
var WeblitResource = require('../').module('./model/weblit-resource');

describe('WeblitResource', function() {
  var resources;

  beforeEach(db.wipe);
  beforeEach(function(done) {
    WeblitResource.create(RESOURCES, function(err) {
      if (err) return done(err);
      resources = [].slice.call(arguments, 1);
      done();
    });
  });

  it('should work', function(done) {
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
    var resource = new WeblitResource(RESOURCES[0]);
    resource.save(function(err) {
      err.code.should.equal(11000);
      done();
    });
  });

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

  it('should find tagged resources', function() {
    resources[1].title.should.eql("'deleted' entry");
    WeblitResource.findTagged(function(err, tagged) {
      if (err) return done(err);
      tagged.length.should.be.above(0);
      tagged.forEach(function(r) {
        r.title.should.not.eql(resources[1].title);
      });
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
