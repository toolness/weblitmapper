var Readable = require('stream').Readable;
var util = require('util');

util.inherits(MakeStream, Readable);

function MakeStream(api, searchOptions) {
  Readable.call(this, {objectMode: true});
  this._currPage = 0;
  this._api = api;
  this._searchOptions = searchOptions;
  this._receivedMakes = [];
}

MakeStream.prototype._read = function() {
  if (this._receivedMakes.length)
    return this.push(this._receivedMakes.shift());
  this._api
    .find(this._searchOptions)
    .page(this._currPage++)
    .then(function(err, makes) {
      if (err) return this.emit('error', err);
      if (!makes.length) return this.push(null);
      this._receivedMakes.push.apply(this._receivedMakes, makes);
      this._read();
    }.bind(this));
};

module.exports = MakeStream;
