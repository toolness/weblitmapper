$(window).load(function() {
  var _ = require('underscore');
  var settings = require('./lib/public-settings');
  var MakeStream = require('./lib/browser/make-stream');
  var InfiniteScrollStream = require('./lib/browser/infinite-scroll-stream');

  var makeStream = new MakeStream($("#filter-criteria").val());
  var output = new InfiniteScrollStream($(".make-gallery"));

  makeStream.on('end', function() {
    $(".make-gallery-throbber").fadeOut();
  }).pipe(output);
  $(window).on('scroll resize', output.onViewChanged);
});
