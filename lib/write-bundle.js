var fs = require('fs');
var path = require('path');
var util = require('util');
var stream = require('stream');
var browserify = require('browserify');
var nunjucks = require('nunjucks');
var through = require('through');

var publicSettings = require('./public-settings');
var paths = require('./paths');

function logError(name, e) {
  var msg = 'Error ' + name + ': ' + e.toString();
  console.error(msg);
  return msg;
}

function listdir(basePath, ext, keepExt) {
  return fs.readdirSync(basePath).filter(function(filename) {
    return path.extname(filename) == ext;
  }).map(function(filename) {
    return basePath + '/' + (keepExt ? filename
                                     : path.basename(filename, ext));
  });
}

function bufferStream(code) {
  var s = new stream.Transform();
  s.push(new Buffer(code, 'utf8'));
  s.push(null);
  return s;
}

function TemplateStream(templates, logErrors) {
  stream.Readable.call(this);
  this._templates = templates;
  this._logErrors = logErrors;
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
  } catch (e) {
    if (this._logErrors) {
      var msg = logError('precompiling template ' + filename, e);
      this.push('\n;console.error(' + JSON.stringify(msg) + ');');
    } else
      this.emit('error', e);
  }
};

// Some of the raw scripts we include inspect node globals as a form
// of feature detection, to see if they're running in the browser or not,
// so we'll explicitly undefine all globals to make sure they don't get
// the wrong impression.
function throughWithoutNodeGlobals() {
  var firstChunk = true;
  return through(function(chunk) {
    if (firstChunk) {
      this.queue('require = module = exports = undefined;\n');
      firstChunk = false;
    }
    this.queue(chunk);
  });
}

function writeBundle(options) {
  options = options || {};
  var templates = new TemplateStream(listdir('./template/browser', '.html',
                                             true), options.logErrors);
  var rawFiles = [
    paths.fromRoot('./node_modules/makeapi-client/src/make-api.js'),
    paths.fromRoot('./node_modules/nunjucks/browser/nunjucks-slim.js')
  ];
  var browserifier = browserify({
    basedir: paths.fromRoot('.'),
    noParse: rawFiles,
    entries: [
      bufferStream(publicSettings.exportToBrowser()),
      templates
    ].concat(rawFiles)
  }).transform(function(file) {
    if (rawFiles.indexOf(file) == -1) return through();
    return throughWithoutNodeGlobals();
  }).require('underscore')
    .require('./lib/public-settings')
    .require('./lib/template-base')
    .require('./lib/weblitmap')
    .require('./lib/make-stream');
  listdir('./lib/browser', '.js').forEach(function(module) {
    browserifier.require(module);
  });

  var bundled = browserifier.bundle({debug: options.logErrors});
  if (options.logErrors)
    bundled.on('error', function(err) {
      bundled.end(logError('writing bundle', err));
    });
  return bundled;
}

module.exports = writeBundle;

if (!module.parent)
  writeBundle(process.stdout);
