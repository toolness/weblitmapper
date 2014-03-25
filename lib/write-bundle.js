var fs = require('fs');
var util = require('util');
var stream = require('stream');
var browserify = require('browserify');
var nunjucks = require('nunjucks');

var publicSettings = require('./public-settings');
var paths = require('./paths');

function bufferStream(code) {
  var s = new stream.Transform();
  s.push(new Buffer(code, 'utf8'));
  s.push(null);
  return s;
}

function TemplateStream(templates) {
  stream.Readable.call(this);
  this._templates = templates;
}

util.inherits(TemplateStream, stream.Readable);

TemplateStream.prototype._read = function() {
  if (!this._templates.length) return this.push(null);
  var filename = this._templates.shift();
  var absPath = paths.fromRoot(filename);
  try {
    this.push(new Buffer(nunjucks.precompile(absPath, {
      name: filename
    }), 'utf8'));
  } catch(e) {
    this.emit('error', e);
  }
};

function writeBundle(output, options) {
  options = options || {};
  var streams = [
    bufferStream(publicSettings.exportToBrowser()),
    './node_modules/makeapi-client/src/make-api.js',
    './node_modules/nunjucks/browser/nunjucks-slim.js',
    new TemplateStream([
      './template/browser/make-item.html'
    ]),
    browserify({
      baseDir: paths.fromRoot('.')
    }).require('util')
      .require('stream')
      .require('underscore')
      .require('url')
      .require('querystring')
      .require('./lib/public-settings')
      .require('./lib/weblitmap')
      .require('./lib/pretty-date')
      .require('./lib/make-stream')
      .bundle()
  ];

  function writeNextStream() {
    var stream = streams.shift();
    if (typeof(stream) == 'string')
      stream = fs.createReadStream(paths.fromRoot(stream));
    if (options.logErrors)
      stream.on('error', function(err) {
        var msg = 'Error writing bundle: ' + err.toString();
        console.error(msg);
        output.write('\n;console.error(' + JSON.stringify(msg) + ');');
        streams.length ? writeNextStream() : output.end();
      });
    stream.pipe(output, {end: !streams.length});
    if (streams.length) stream.on('end', writeNextStream);
  }

  writeNextStream();
  return output;
}

module.exports = writeBundle;

if (!module.parent)
  writeBundle(process.stdout);
