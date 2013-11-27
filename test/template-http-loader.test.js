var sinon = require('sinon');
var assert = require('should');

var HttpLoader = require('../').HttpLoader;

describe('HttpLoader', function() {
  var req, app, loader;

  beforeEach(function() {
    app = {use: sinon.spy()};
    req = sinon.spy();
  });

  it('should empty cache only when reloadtemplates=1', function() {
    var loader = new HttpLoader('http://example.org', app, req);
    var middleware = app.use.firstCall.args[0];
    var next = sinon.spy();
    loader.emptyCache = sinon.spy();

    middleware({query: {}}, null, next);
    loader.emptyCache.callCount.should.eql(0);
    next.callCount.should.eql(1);

    middleware({query: {reloadtemplates: '1'}}, null, next);
    loader.emptyCache.callCount.should.eql(1);
    next.callCount.should.eql(2);
  });

  it('should emit update events when cache is emptied', function() {
    var cb = sinon.spy();
    loader = new HttpLoader('http://example.org', null, req);
    loader.paths['lol'] = true;
    loader.paths['heh'] = true;
    loader.on('update', cb);
    loader.emptyCache();
    cb.args.should.eql([['lol'], ['heh']]);
  });

  it('should properly resolve URLs', function() {
    loader = new HttpLoader('http://example.org', null, req);
    loader.getSource('foo.html');
    req.args[0][0].should.eql('http://example.org/foo.html');
  });

  it('should return err w/ 500 response codes', function(done) {
    loader = new HttpLoader('http://u', null, req);
    loader.getSource('foo.html', function(err, res) {
      loader.paths['foo.html'].should.be.true;
      err.message.should.eql('http://u/foo.html returned status 500');
      done();
    });
    req.args[0][1](null, {statusCode: 500});
  });

  it('should return null w/ 400-499 response codes', function(done) {
    loader = new HttpLoader('http://example.org', null, req);
    loader.getSource('foo.html', function(err, res) {
      loader.paths['foo.html'].should.be.true;
      assert(err === null);
      assert(res === null);
      done();
    });
    req.args[0][1](null, {statusCode: 404});
  });

  it('should return success w/ 200 response codes', function(done) {
    loader = new HttpLoader('http://example.org', null, req);
    loader.getSource('foo.html', function(err, res) {
      loader.paths['foo.html'].should.be.true;
      assert(err === null);
      res.src.should.eql('hi there');
      done();
    });    
    req.args[0][1](null, {statusCode: 200}, 'hi there');
  });
});
