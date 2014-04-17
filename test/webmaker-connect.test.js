var testUtil = require('./lib/util');

describe("webmaker connect middleware", function() {
  it('defines GET /wmconnect/login', function() {
    testUtil.app().should.have.route('GET', '/wmconnect/login');
  });

  it('defines GET /wmconnect/callback', function() {
    testUtil.app().should.have.route('GET', '/wmconnect/callback');
  });

  it('defines POST /wmconnect/logout', function() {
    testUtil.app().should.have.route('POST', '/wmconnect/logout');
  });  
});
