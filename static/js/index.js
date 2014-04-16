$(window).load(function() {
  var _ = require('underscore');
  var settings = require('./lib/public-settings');
  var MakeStream = require('./lib/browser/make-stream');
  var parseQuery = require('./lib/browser/parse-search-query');
  var InfiniteScrollStream = require('./lib/browser/infinite-scroll-stream');

  var query = parseQuery($("#filter-criteria").val(), {namespace: true});
  var makeStream = new MakeStream();
  var output = new InfiniteScrollStream($(".make-gallery"));

  makeStream.on('end', function() {
    $(".make-gallery-throbber").fadeOut();
  }).pipe(output);
  $(window).on('scroll resize', output.onViewChanged);
});
