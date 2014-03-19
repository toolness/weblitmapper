var through = require('through');

var MakeStream = require('./make-stream');
var makeapi = require('./makeapi');

function pickAndNormalizeTags(make) {
  var form = new makeapi.MakeForm({});
  form.loadFrom(make);
  return {
    title: make.title,
    description: make.description,
    url: make.url,
    username: make.username,
    tags: form.toMakeTags()
  };
}

function WeblitStream() {
  var stream = new MakeStream(makeapi.getAPI(), {
    tagPrefix: makeapi.WEBLIT_TAG_PREFIX
  });

  return stream.pipe(through(function(make) {
    this.queue(pickAndNormalizeTags(make));
  }));
};

module.exports = WeblitStream;

if (!module.parent)
  WeblitStream().on('data', console.log.bind(console));
