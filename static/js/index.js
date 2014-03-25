var util = require('util');
var Writable = require('stream').Writable;
var _ = require('underscore');
var url = require('url');
var querystring = require('querystring');
var settings = require('./lib/public-settings');
var weblitmap = require('./lib/weblitmap');
var prettyDate = require('./lib/pretty-date');
var MakeStream = require('./lib/make-stream');

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

function isNotTooFarOffscreen(elem) {
  return $(elem).offset().top - window.pageYOffset < 
         window.innerHeight;
}

function InfiniteScrollStream(el) {
  Writable.call(this, {objectMode: true, highWaterMark: 10});
  this._mostRecentItem = this._onVisibleCallback = null;
  this.onViewChanged = this._onViewChanged.bind(this);
  this.el = $(el)[0];
  this.msnry = new Masonry(this.el);
  this.msnry.on('layoutComplete', this.onViewChanged);
}

util.inherits(InfiniteScrollStream, Writable);

InfiniteScrollStream.prototype._write = function(make, encoding, cb) {
  var html = env.render('./template/browser/make-item.html', {
    make: new NormalizedMake(make),
    weblitmap: weblitmap
  });
  var item = $('<div></div>').html(html).find('.make-item')[0];
  this._mostRecentItem = item;
  this._onVisibleCallback = cb;
  this.el.appendChild(item);
  this.msnry.appended(item);
  this.msnry.layout();
};

InfiniteScrollStream.prototype._onViewChanged = function() {
  if (!this._mostRecentItem) return;
  if (isNotTooFarOffscreen(this._mostRecentItem)) {
    var cb = this._onVisibleCallback;
    this._mostRecentItem = this._onVisibleCallback = null;
    cb();
  }
};

var env = new nunjucks.Environment(new nunjucks.WebLoader(), {
  autoescape: true
});

var makeapi = new Make({
  apiURL: settings.MAKEAPI_URL
});
var makeStream = new MakeStream(makeapi, {
  tagPrefix: settings.WEBLIT_TAG_PREFIX,
  sortByField: 'createdAt'
});
var output = new InfiniteScrollStream($(".make-gallery"));

$(window).load(function() {
  makeStream.pipe(output);
}).on('scroll resize', output.onViewChanged);
