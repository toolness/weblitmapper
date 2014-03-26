var _ = require('underscore');
var settings = require('./lib/public-settings');
var maybeShowOriginWarning = require('./lib/browser/origin-warning');
var MakeStream = require('./lib/make-stream');
var InfiniteScrollStream = require('./lib/browser/infinite-scroll-stream');

var makeapi = new Make({
  apiURL: settings.MAKEAPI_URL
});
var makeStream = new MakeStream(makeapi, {
  tagPrefix: settings.WEBLIT_TAG_PREFIX,
  sortByField: 'createdAt'
});
var output = new InfiniteScrollStream($(".make-gallery"));

$(window).load(function() {
  makeStream.pipe(output);
  maybeShowOriginWarning($('#alerts'));
}).on('scroll resize', output.onViewChanged);
