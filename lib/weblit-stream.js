var through = require('through');

var MakeStream = require('./make-stream');
var makeapi = require('./makeapi');
var settings = require('./public-settings');
var weblitmap = require('./weblitmap');

function pickAndNormalizeTags(make) {
  return {
    title: make.title,
    description: make.description,
    url: make.url,
    username: make.username,    
    createdAt: new Date(make.createdAt).toISOString(),
    tags: weblitmap.normalizeTags(make.tags, settings.WEBLIT_TAG_PREFIX),
    emailHash: make.emailHash,
    likes: make.likes.length
  };
}

function WeblitStream() {
  var stream = new MakeStream(makeapi.getAPI(), {
    tagPrefix: settings.WEBLIT_TAG_PREFIX,
    sortByField: 'createdAt'
  });

  return stream.pipe(through(function(make) {
    this.queue(pickAndNormalizeTags(make));
  }));
};

module.exports = WeblitStream;

if (!module.parent)
  WeblitStream().on('data', console.log.bind(console));
