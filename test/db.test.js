var should = require('should');

var db = require('./db');

describe('db', function() {
  beforeEach(db.wipe);

  it('should be using the test db when running test suite', function() {
    db.name.should.eql('test');
  });

  it('should allow for saving of models', function(done) {
    var Cat = db.model('Cat', {name: String});
    var mayze = new Cat({name: 'Mayze'});
    mayze.save(done);
  });
});
