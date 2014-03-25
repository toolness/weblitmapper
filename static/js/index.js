var util = require('util');
var Writable = require('stream').Writable;
var _ = require('underscore');
var url = require('url');
var querystring = require('querystring');
var MakeStream = require('./lib/make-stream');

// http://stackoverflow.com/a/13885228
function isFullyVisible (elem) {
  var off = elem.offset();
  var et = off.top;
  var el = off.left;
  var eh = elem.height();
  var ew = elem.width();
  var wh = window.innerHeight;
  var ww = window.innerWidth;
  var wx = window.pageXOffset;
  var wy = window.pageYOffset;
  return (et >= wy && el >= wx && et + eh <= wh + wy && el + ew <= ww + wx);
}

function normalizeMake(make) {
  var parsedURL = url.parse(make.url);

  make.avatarURL = 'http://www.gravatar.com/avatar/' + make.emailHash +
                   '?' + querystring.stringify({
                     s: 44,
                     d: 'https://stuff.webmaker.org/avatars/' +
                        'webmaker-avatar-44x44.png'
                   });
  make.profileURL = CONFIG.WEBMAKER_URL + '/u/' + make.username;
  make.updateURL = '/update?' + querystring.stringify({
    url: make.url
  });
  make.urlSimplified = parsedURL.hostname +
                       (parsedURL.pathname == '/' ? '' : parsedURL.pathname);

  return make;
}

function InfiniteScrollStream() {
  Writable.call(this, {objectMode: true, highWaterMark: 10});
  this._mostRecentItem = this._onVisibleCallback = null;
  this.onViewChanged = this._onViewChanged.bind(this);
}

util.inherits(InfiniteScrollStream, Writable);

InfiniteScrollStream.prototype._write = function(make, encoding, cb) {
  var html = env.render('./template/browser/make-item.html', {
    make: normalizeMake(make)
  });
  this._mostRecentItem = $('<div></div>').html(html)
    .appendTo(".make-gallery");
  this._onVisibleCallback = cb;
  this._onViewChanged();
};

InfiniteScrollStream.prototype._onViewChanged = function() {
  if (!this._mostRecentItem) return;
  if (isFullyVisible(this._mostRecentItem)) {
    var cb = this._onVisibleCallback;
    this._mostRecentItem = this._onVisibleCallback = null;
    cb();
  }
};

var env = new nunjucks.Environment(new nunjucks.WebLoader(), {
  autoescape: true
});

var makeapi = new Make({
  apiURL: CONFIG.MAKEAPI_URL
});
var makeStream = new MakeStream(makeapi, {
  tagPrefix: CONFIG.WEBLIT_TAG_PREFIX,
  sortByField: 'createdAt'
});
var output = new InfiniteScrollStream();

$(window).load(function() {
  makeStream.pipe(output);
}).on('scroll resize', output.onViewChanged);
