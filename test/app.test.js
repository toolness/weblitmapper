var sinon = require('sinon');

var request = require('./lib/util').request;

describe("app", function() {
  it('reports errors', function(done) {
    request({testRoutes: {
      'GET /forced-error': function(req, res, next) {
        sinon.stub(process.stderr, 'write');
        next(new Error('omg kaboom'));
      }
    }})
      .get('/forced-error')
      .expect('Sorry, something exploded!')
      .expect(500, function(err) {
        process.stderr.write.calledWithMatch('omg kaboom').should.eql(true);
        process.stderr.write.restore();
        done(err);
      });
  });

  it('protects POST endpoints with CSRF', function(done) {
    request()
      .post('/blargy')
      .expect('Content-Type', 'text/plain')
      .expect('Forbidden')
      .expect(403, done);
  });

  it('disallows access to /test/ when not in debug mode', function(done) {
    request()
      .get('/test/')
      .expect(404, done);
  });

  it('allows access to /test/ when in debug mode', function(done) {
    request({debug: true})
      .get('/test/')
      .expect(200, done);
  });
});
