var util = require('util');
var Writable = require('stream').Writable;

var weblitmap = require('../weblitmap');
var template = require('./template');
var MakeItem = require('./make-item');

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
  var html = template.render('./template/browser/make-item.html', {
    make: new MakeItem(make),
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

module.exports = InfiniteScrollStream;
