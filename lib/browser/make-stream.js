var Readable = require('stream').Readable;
var util = require('util');

var REQUEST_TIMEOUT = 20000;

util.inherits(MakeStream, Readable);

function MakeStream() {
  Readable.call(this, {objectMode: true});
  this._currPage = 1;
  this._receivedMakes = [];
}

MakeStream.prototype._read = function() {
  if (this._receivedMakes.length)
    return this.push(this._receivedMakes.shift());
  $.ajax('/json', {
    data: {p: this._currPage},
    timeout: REQUEST_TIMEOUT,
    success: function(makes, textStatus, xhr) {
      this._currPage++;
      if (!makes.length) return this.push(null);
      this._receivedMakes.push.apply(this._receivedMakes, makes);
      this._read();
    }.bind(this),
    error: function(xhr, textStatus, errorThrown) {
      if (textStatus == 'timeout')
        return this._read();
      this.emit('error', new Error("Ajax error " + textStatus + " " +
                                   errorThrown));
    }.bind(this)
  });
};

module.exports = MakeStream;
