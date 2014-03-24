var fs = require('fs');
var path = require('path');
var browserify = require('browserify');

var ROOT_DIR = path.normalize(__dirname + '/..');

function writeBundle(output) {
  var streams = [
    './node_modules/makeapi-client/src/make-api.js',
    './node_modules/nunjucks/browser/nunjucks-slim.js',
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
