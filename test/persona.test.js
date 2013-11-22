var testUtil = require('./lib/util');

describe("persona middleware", function() {
  it('defines PERSONA_JS_URL in app.locals', function() {
    testUtil.app().locals.PERSONA_JS_URL
      .should.match(/persona\.org\/include\.js/);
  });

  it('defines POST /persona/verify', function() {
    testUtil.app().should.have.route('POST', '/persona/verify');
  });

  it('defines POST /persona/logout', function() {
    testUtil.app().should.have.route('POST', '/persona/logout');
  });  
});
