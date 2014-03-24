var util = require('util');
var Writable = require('stream').Writable;
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

function InfiniteScrollStream() {
  Writable.call(this, {objectMode: true, highWaterMark: 10});
  this._mostRecentItem = this._onVisibleCallback = null;
  this.onViewChanged = this._onViewChanged.bind(this);
}

util.inherits(InfiniteScrollStream, Writable);

InfiniteScrollStream.prototype._write = function(info, encoding, cb) {
  var html = env.render('./template/browser/make-item.html', {
    make: info
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

var env = new nunjucks.Environment(new nunjucks.WebLoader());

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
