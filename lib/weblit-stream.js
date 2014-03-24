var through = require('through');

var MakeStream = require('./make-stream');
var weblitmap = require('./weblitmap');
var makeapi = require('./makeapi');

function pickAndNormalizeTags(make) {
  return {
    title: make.title,
    description: make.description,
    url: make.url,
    username: make.username,
    createdAt: new Date(make.createdAt).toISOString(),
    tags: weblitmap.normalizeTags(make.tags, makeapi.WEBLIT_TAG_PREFIX)
  };
}

function WeblitStream() {
  var stream = new MakeStream(makeapi.getAPI(), {
    tagPrefix: makeapi.WEBLIT_TAG_PREFIX,
    sortByField: 'createdAt'
  });

  return stream.pipe(through(function(make) {
    this.queue(pickAndNormalizeTags(make));
  }));
};

module.exports = WeblitStream;

if (!module.parent)
  WeblitStream().on('data', console.log.bind(console));
