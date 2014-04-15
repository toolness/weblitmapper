var should = require('should');

var RESOURCES = require('./fixtures/weblit-resources.json');

var db = require('./db');
var WeblitResource = require('../').module('./model/weblit-resource');

describe('WeblitResource', function() {
  beforeEach(db.wipe);
  beforeEach(function(done) {
    WeblitResource.create(RESOURCES, done);
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
});
