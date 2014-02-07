var _ = require('underscore');
var should = require('should');

var makeapi = require('../').makeapi;

var BASIC_FORM = {
  url: 'http://example.org/',
  title: 'example page',
  description: 'a fine example page.'
};

describe('makeapi.MakeForm', function() {
  it('works with tags', function() {
    var form = new makeapi.MakeForm(_.extend({
      'weblit_exploring': 'on'
    }, BASIC_FORM));

    form.hasTag('exploring').should.be.true;
    form.hasTag('building').should.be.false;

    var make = _.extend({
      tags: ['weblit-building', 'foo']
    }, BASIC_FORM);
    form.loadFrom(make);

    form.hasTag('exploring').should.be.false;
    form.hasTag('building').should.be.true;

    form.setTag('exploring', true);
    form.setTag('building', false);
    form.updateTags(make);

    make.tags.should.eql(['weblit-exploring', 'foo']);
  });
});
