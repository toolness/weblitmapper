var _ = require('underscore');
var should = require('should');

var db = require('./db');
var makeapi = require('../').makeapi;
var WeblitResource = require('../').module('./model/weblit-resource');

var BASIC_FORM = {
  url: 'http://example.org/',
  title: 'example page',
  description: 'a fine example page.'
};

describe('makeapi.MakeForm', function() {
  beforeEach(db.wipe);

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

    form.createOrUpdate({
      make: null,
      username: 'foo',
      email: 'foo@bar.org'
    }, function(err) {
      if (err) return done(err);

      WeblitResource.findOne({url: BASIC_FORM.url}, function(err, info) {
        if (err) return done(err);
        info.title.should.eql(BASIC_FORM.title);
        done();
      });
    });
  });

  it('saves existing makes when needed', function(done) {
    var form = new makeapi.MakeForm(_.clone(BASIC_FORM));
    var make = new WeblitResource({
      url: BASIC_FORM.url,
      title: 'hmm',
      description: 'hmmmmmm',
      email: 'foo@bar.org'
    });

    form.createOrUpdate({make: make}, function(err) {
      if (err) return done(err);

      WeblitResource.findOne({url: BASIC_FORM.url}, function(err, info) {
        if (err) return done(err);
        info.title.should.eql(BASIC_FORM.title);
        info.description.should.eql(BASIC_FORM.description);
        info.email.should.eql('foo@bar.org');
        done();
      });
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
