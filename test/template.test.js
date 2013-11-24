var _ = require('underscore');

var testUtil = require('./lib/util');
var request = testUtil.request;

function objectifyStr(str) {
  return {toString: function() { return str; }}
}

describe("template middleware", function() {
  it('auto-escapes template variables', function(done) {
    request({
      testRoutes: {
        'GET /escaping': function(req, res) {
          return res.render('escaping.html', {foo: '<script>'});
        }
      },
      testTemplates: {'escaping.html': 'hi {{foo}}'}
    })
      .get('/escaping')
      .expect('hi &lt;script&gt;')
      .expect(200, done);
  });

  it('defines response.render.SafeString', function() {
    testUtil.app().response.render.SafeString
      .should.be.a('function');
  });

  it('defines DOT_MIN in app.locals', function() {
    testUtil.app({debug: true}).locals.DOT_MIN
      .should.equal('');
    testUtil.app({debug: false}).locals.DOT_MIN
      .should.equal('.min');
  });

  it('defines csrfToken in res.locals', function(done) {
    request({testRoutes: {
      'GET /csrf': function(req, res) {
        res.send(typeof(res.locals.csrfToken) + res.locals.csrfToken.length);
      }
    }}).get('/csrf').expect('string24', done);
  });

  it('defines email in res.locals', function(done) {
    request({testRoutes: {
      'GET /email': function(req, res) {
        res.send(typeof(res.locals.email) + res.locals.email.length);
      }
    }}).get('/email').expect('string0', done);
  });

  it('defines the normalizeURL filter', function() {
    var normalizeURL = testUtil.app().nunjucksEnv.getFilter('normalizeURL');
    normalizeURL('foo.org/blah').should.eql('http://foo.org/blah');
    normalizeURL(objectifyStr('o.org')).should.eql('http://o.org');
  });

  it('defines the domain filter', function() {
    var domain = testUtil.app().nunjucksEnv.getFilter('domain');
    domain('foo.org/blah').should.eql('foo.org');
    domain(objectifyStr('o.org/')).should.eql('o.org');
  });

  it('defines the squishName filter', function() {
    var squishName = testUtil.app().nunjucksEnv.getFilter('squishName');
    squishName('Hey There').should.eql('heythere');
    squishName(objectifyStr('HI')).should.eql('hi');
  });
});

describe("layout.html", function() {
  function layoutRequest(options) {
    return request({
      testRoutes: {
        'GET /layout': function(req, res) {
          if (options.flash)
            req.flash.apply(req, options.flash);
          return res.render('layout.html');
        }
      },
      defineExtraMiddleware: function(app) {
        app.use(function(req, res, next) {
          _.extend(res.locals, options.resLocals);
          next();
        });
      }
    }).get('/layout');
  }

  it('defines csrf meta tag', function(done) {
    layoutRequest({resLocals: {csrfToken: "CSRFTOKEN IS HERE"}})
      .expect(/<meta name="csrf" content="CSRFTOKEN IS HERE">/)
      .end(done);
  });

  it('defines email meta tag', function(done) {
    layoutRequest({resLocals: {email: "foo@bar.org"}})
      .expect(/<meta name="email" content="foo@bar.org">/)
      .end(done);
  });

  it('displays flash message content', function(done) {
    layoutRequest({flash: ['info', '<hi']})
      .expect(/&lt;hi/)
      .end(done);
  });

  it('displays flash message category', function(done) {
    layoutRequest({flash: ['infoMessageCategory', 'yo']})
      .expect(/infoMessageCategory/)
      .end(done);
  });
});
