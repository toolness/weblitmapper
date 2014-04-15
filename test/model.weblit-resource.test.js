var should = require('should');

var db = require('./db');
var WeblitResource = require('../').module('./model/weblit-resource');
var fixture = require('./fixtures/weblit-resources.json');

describe('WeblitResource', function() {
  beforeEach(db.wipe);

  it('should work', function(done) {
    var resource = new WeblitResource(fixture[0]);
    resource.save(function(err, resource) {
      if (err) return done(err);
      resource.username.should.eql('chadsansing');
      resource.likes[0].username.should.eql('michelle');
      resource.tags[0].should.eql('weblit-Exploring');
      done();
    });
  });
});
