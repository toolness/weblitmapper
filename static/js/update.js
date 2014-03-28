$(function() {
  var disqus = require('./lib/browser/disqus');
  var session = require('./lib/browser/session');

  if (disqus.isEnabled()) disqus.loadEmbed(window, session.resourceURL);
});
