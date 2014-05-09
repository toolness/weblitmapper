var Readable = require('stream').Readable;
var util = require('util');
var JSONStream = require('JSONStream');

var db = require('../test/db');
var allModels = require('../').model.all;

var jsonStream = JSONStream.stringify();

function ModelStream(models) {
  Readable.call(this, {objectMode: true});
  this._models = models;
  this._currModel = null;
  this._currStream = null;
}

util.inherits(ModelStream, Readable);

ModelStream.prototype._read = function() {
  if (!this._currModel) {
    if (!this._models.length)
      return this.push(null);
    this._currModel = this._models.pop();
    this._currStream = this._currModel.find({}).lean().stream();
    this._currStream.on('error', function(err) {
      this.emit('error', err);
    }.bind(this));
    this._currStream.on('data', function(data) {
      this._currStream.pause();
      this.push(data);
    }.bind(this));
    this._currStream.on('end', function() {
      this._currModel = this._currStream = null;
      this._read();
    }.bind(this));
    this._currStream.pause();
  }
  this._currStream.resume();
};

new ModelStream(allModels())
  .on('end', db.close.bind(db))
  .pipe(jsonStream)
  .pipe(process.stdout);
