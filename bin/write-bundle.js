var fs = require('fs');
var util = require('util');
var stream = require('stream');
var path = require('path');
var browserify = require('browserify');
var nunjucks = require('nunjucks');

var ROOT_DIR = path.normalize(__dirname + '/..');

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
