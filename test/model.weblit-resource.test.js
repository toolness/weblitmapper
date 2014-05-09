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
});

describe('WeblitResource.findFromStringQuery()', function() {
  beforeEach(db.wipe);
  beforeEach(db.loadFixture(RESOURCES));

  it('should find tagged resources', function(done) {
    RESOURCES[1].title.should.eql("'deleted' entry");
    WeblitResource.findFromStringQuery('', function(err, tagged) {
      if (err) return done(err);
      tagged.length.should.be.above(0);
      tagged.forEach(function(r) {
        r.title.should.not.eql(RESOURCES[1].title);
      });
      done();
    });
  });

  it('should paginate results', function(done) {
    var stuff = [];
    for (var i = 0; i < 10; i++)
      stuff.push({
        model: 'WeblitResource',
        url: 'http://example.org/' + i,
        tags: ['weblit-Building']
      });
    db.loadFixture(stuff, function(err) {
      if (err) return done(err);
      WeblitResource.findFromStringQuery('', {
        page: 1,
        pageSize: 5
      }, function(err, tagged) {
        if (err) return done(err);
        tagged.length.should.eql(5);
        WeblitResource.findFromStringQuery('', {
          page: 15,
          pageSize: 5
        }, function(err, tagged) {
          if (err) return done(err);
          tagged.length.should.eql(0);          
          done();
        });
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
      resource.numLikes.should.eql(1);
      done();
    });
  });

  it('should show up in the statistics', function(done) {
    var resource = new WeblitResource({
      url: 'http://example.org',
      tags: ['weblit-Exploring', 'weblit-Search']
    });
    resource.save(function(err) {
      if (err) return done(err);
      WeblitResource.getStats(function(err, stats) {
        if (err) return done(err);
        stats.should.eql({
          "total": 1,
          "tagCounts": {
            "Exploring": 1,
            "Navigation": 0,
            "WebMechanics": 0,
            "Search": 1,
            "Credibility": 0,
            "Security": 0,
            "Building": 0,
            "Composing": 0,
            "Remixing": 0,
            "DesignAccessibility": 0,
            "Coding": 0,
            "Infrastructure": 0,
            "Connecting": 0,
            "Sharing": 0,
            "Collaborating": 0,
            "Community": 0,
            "Privacy": 0,
            "OpenPractices": 0
          }
        });
        done();
      });
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
