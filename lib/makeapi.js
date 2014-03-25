var _ = require('underscore');
var Make = require('makeapi-client');

var weblitmap = require('./weblitmap');
var settings = require('./public-settings');

var WEBLIT_TAG_PREFIX = settings.WEBLIT_TAG_PREFIX;
var WEBLIT_TAG_PREFIX_REGEXP = new RegExp('^' + WEBLIT_TAG_PREFIX);

function getAPIURL() { return settings.MAKEAPI_URL; }

function getAPI() {
  if (getAPIURL() == ':memory:')
    return new (require('../test/lib/fake-makeapi-client'))();
  return new Make({
    apiURL: getAPIURL(),
    hawk: {
      key: process.env.MAKEAPI_PRIVATE_KEY,
      id: process.env.MAKEAPI_PUBLIC_KEY,
      algorithm: "sha256"
    }
  });
};

function makeForURL(url, cb) {
  getAPI()
    .url(url)
    .then(function(err, makes) {
      if (err) return cb(err);
      cb(null, makes.length ? makes[0] : null);
    }); 
}

function MakeForm(form) {
  function copyStrings(source, target) {
    _.extend(target, _.pick(source, 'url', 'title', 'description'));
  }

  copyStrings(form, this);

  this.setTag = function(tag, value) {
    if (value) {
      form['weblit_' + tag] = 'on';
    } else {
      delete form['weblit_' + tag];
    }
  };

  this.getNormalizedTags = function() {
    var tags = Object.keys(weblitmap.tags).filter(this.hasTag, this);
    return weblitmap.normalizeTags(tags);
  };

  this.hasTag = function(tag) {
    var formProp = 'weblit_' + tag;
    return (formProp in form && form[formProp] == 'on');
  };

  this.loadFrom = function(make) {
    var makeTags = {};
    copyStrings(make, this);
    make.tags.forEach(function(tag) {
      makeTags[tag.toLowerCase()] = true;
    });
    Object.keys(weblitmap.tags).forEach(function(tag) {
      this.setTag(tag, WEBLIT_TAG_PREFIX + tag.toLowerCase() in makeTags);
    }, this);
  };

  this.toMakeTags = function() {
    return this.getNormalizedTags()
      .map(function(tag) { return WEBLIT_TAG_PREFIX + tag; })
  };

  this.updateTags = function(make) {
    var nonWeblitTags = make.tags.filter(function(tag) {
      return !WEBLIT_TAG_PREFIX_REGEXP.test(tag);
    });

    make.tags = this.toMakeTags().concat(nonWeblitTags);
  };

  this.validate = function() {
    var errors = [];

    if (!/^https?:\/\//.test(form.url))
      errors.push('Invalid URL.');
    if (!form.title)
      errors.push('Title cannot be empty.');

    return errors;
  };

  this.createOrUpdate = function(make, email, cb) {
    if (make) {
      make.title = form.title;
      make.description = form.description;
      this.updateTags(make);
      make.update(email, cb);
    } else {
      getAPI().create({
        email: email,
        url: form.url,
        contentType: 'text/html',
        locale: 'en-US',
        title: form.title,
        description: form.description,
        tags: this.toMakeTags(),
      }, cb);
    }
  };
}

module.exports = Object.create({
  getAPI: getAPI,
  makeForURL: makeForURL,
  MakeForm: MakeForm
}, {
  url: {get: getAPIURL}
});
