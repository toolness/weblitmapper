var util = require('util');
var Writable = require('stream').Writable;

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
  var item = new MakeItem(make, this.el);
  this._mostRecentItem = item;
  this._onVisibleCallback = cb;
  this.el.appendChild(item.el);
  this.msnry.appended(item.el);
  this.msnry.layout();
};

InfiniteScrollStream.prototype._onViewChanged = function() {
  if (!this._mostRecentItem) return;
  if (isNotTooFarOffscreen(this._mostRecentItem.el)) {
    var cb = this._onVisibleCallback;
    this._mostRecentItem = this._onVisibleCallback = null;
    cb();
  }
};

module.exports = InfiniteScrollStream;
