var should = require('should');

var db = require('./db');
var WeblitResource = require('../').module('./model/weblit-resource');

describe('WeblitResource', function() {
  beforeEach(db.wipe);

  it('should work', function(done) {
    var webmaker = new WeblitResource({
      title: 'Mozilla Webmaker',
      url: 'https://webmaker.org',
      description: 'Learn how to make stuff on the Web.',
      username: 'toolness'
    });
    webmaker.save(done);
  });
});
