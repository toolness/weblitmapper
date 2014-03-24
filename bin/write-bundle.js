var fs = require('fs');
var util = require('util');
var stream = require('stream');
var path = require('path');
var browserify = require('browserify');
var nunjucks = require('nunjucks');

var makeapi = require('../lib/makeapi');

var ROOT_DIR = path.normalize(__dirname + '/..');

function JsonLiteralStream(name, obj) {
  stream.Readable.call(this);
  this._name = name;
  this._obj = obj;
}

util.inherits(JsonLiteralStream, stream.Readable);

JsonLiteralStream.prototype._read = function() {
  var chunk = 'var ' + this._name +
              ' = ' + JSON.stringify(this._obj, null, 2) + ';\n';
  this.push(new Buffer(chunk, 'utf8'));
  this.push(null);
};

function TemplateStream(templates) {
  stream.Readable.call(this);
  this._templates = templates;
}

util.inherits(TemplateStream, stream.Readable);

TemplateStream.prototype._read = function() {
  if (!this._templates.length) return this.push(null);
  var filename = this._templates.shift();
  var absPath = path.resolve(ROOT_DIR, filename);
  this.push(new Buffer(nunjucks.precompile(absPath, {
    name: filename
  }), 'utf8'));
};

function writeBundle(output) {
  var streams = [
    new JsonLiteralStream('CONFIG', {
      MAKEAPI_URL: makeapi.url,
      WEBLIT_TAG_PREFIX: makeapi.WEBLIT_TAG_PREFIX
    }),
    './node_modules/makeapi-client/src/make-api.js',
    './node_modules/nunjucks/browser/nunjucks-slim.js',
    new TemplateStream([
      './template/browser/make-item.html'
    ]),
    browserify({
      baseDir: ROOT_DIR
    }).require('util')
      .require('stream')
      .require('./lib/make-stream')
      .bundle()
  ];

  function writeNextStream() {
    var stream = streams.shift();
    if (typeof(stream) == 'string')
      stream = fs.createReadStream(path.resolve(ROOT_DIR, stream));
    stream.pipe(output, {end: !streams.length});
    if (streams.length) stream.on('end', writeNextStream);
  }

  writeNextStream();
  return output;
}

module.exports = writeBundle;
module.exports.ROOT_DIR = ROOT_DIR;

if (!module.parent)
  writeBundle(process.stdout);
