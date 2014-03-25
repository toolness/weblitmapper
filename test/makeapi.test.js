var _ = require('underscore');
var should = require('should');

var makeapi = require('../').makeapi;
var settings = require('../').publicSettings;
var fakeMakeapi = require('./lib/fake-makeapi-client');

var BASIC_FORM = {
  url: 'http://example.org/',
  title: 'example page',
  description: 'a fine example page.'
};

beforeEach(function() {
  settings.MAKEAPI_URL = ':memory:';
  fakeMakeapi.reset();
});

describe('makeapi.makeForURL', function() {
  it('returns null when make does not exist', function(done) {
    makeapi.makeForURL('http://lol', function(err, make) {
      if (err) return done(err);
      should.equal(make, null);
      done();
    });
  });

  it('returns make when make exists', function(done) {
    (new fakeMakeapi()).create(BASIC_FORM, function(err) {
      if (err) return done(err);
      makeapi.makeForURL(BASIC_FORM.url, function(err, make) {
        if (err) return done(err);
        make.title.should.eql(BASIC_FORM.title);
        done();
      });
    });
  });
});

describe('makeapi.MakeForm', function() {
  it('works with tags', function() {
    var form = new makeapi.MakeForm(_.extend({
      'weblit_Exploring': 'on'
    }, BASIC_FORM));

    form.hasTag('Exploring').should.be.true;
    form.hasTag('Building').should.be.false;

    var make = _.extend({
      tags: ['weblit-building', 'foo']
    }, BASIC_FORM);
    form.loadFrom(make);

    form.hasTag('Exploring').should.be.false;
    form.hasTag('Building').should.be.true;

    form.setTag('Exploring', true);
    form.setTag('Building', false);
    form.updateTags(make);

    make.tags.should.eql(['weblit-Exploring', 'foo']);
  });

  it('creates makes when needed', function(done) {
    var form = new makeapi.MakeForm(_.clone(BASIC_FORM));

    form.createOrUpdate(null, 'foo@bar.org', function(err) {
      if (err) return done(err);

      var info = fakeMakeapi.urls[BASIC_FORM.url];
      info.title.should.eql(BASIC_FORM.title);

      done();
    });
  });

  it('validates properly', function() {
    function validate(options) {
      var form = new makeapi.MakeForm(_.extend({}, BASIC_FORM, options));
      return form.validate();
    }

    validate({}).should.have.length(0);
    validate({url: 'lol'}).should.eql(['Invalid URL.']);
    validate({title: ''}).should.eql(['Title cannot be empty.']);
  });
});
