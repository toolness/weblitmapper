var url = require('url');
var querystring = require('querystring');
var _ = require('underscore');

var prettyDate = require('../pretty-date');
var settings = require('./lib/public-settings');
var weblitmap = require('./lib/weblitmap');

function NormalizedMake(make) {
  var parsedURL = url.parse(make.url);

  _.extend(this, make);
  this.avatarURL = 'http://www.gravatar.com/avatar/' + this.emailHash +
                   '?' + querystring.stringify({
                     d: 'https://stuff.webmaker.org/avatars/' +
                        'webmaker-avatar-44x44.png'
                   });
  this.profileURL = settings.WEBMAKER_URL + '/u/' + this.username;
  this.updateURL = '/update?' + querystring.stringify({
    url: this.url
  });
  this.createdAtPrettyDate = prettyDate(new Date(this.createdAt));
  this.urlSimplified = parsedURL.hostname +
                       (parsedURL.pathname == '/' ? '' : parsedURL.pathname);
  this.weblitTags = {};
  weblitmap
    .normalizeTags(this.tags, settings.WEBLIT_TAG_PREFIX)
    .forEach(function(tag) {
      this.weblitTags[tag] = true;
    }, this);
}

NormalizedMake.prototype = {
  hasWeblitTag: function(tag) {
    return !!this.weblitTags[settings.WEBLIT_TAG_PREFIX + tag];
  }
};

module.exports = NormalizedMake;
