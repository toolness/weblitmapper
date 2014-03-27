$(window).load(function() {
  var _ = require('underscore');
  var settings = require('./lib/public-settings');
  var MakeStream = require('./lib/make-stream');
  var parseQuery = require('./lib/browser/parse-search-query');
  var InfiniteScrollStream = require('./lib/browser/infinite-scroll-stream');

  var query = parseQuery($("#filter-criteria").val(), {namespace: true});
  var makeapi = new Make({apiURL: settings.MAKEAPI_URL});
  var makeStream = new MakeStream(makeapi, _.extend(query, {
    sortByField: 'createdAt'
  }));
  var output = new InfiniteScrollStream($(".make-gallery"));

  makeStream.on('end', function() {
    $(".make-gallery-throbber").fadeOut();
  }).pipe(output);
  $(window).on('scroll resize', output.onViewChanged)
});
