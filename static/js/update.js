$(function() {
  var disqus = require('./lib/browser/disqus');
  var session = require('./lib/browser/session');

  if (disqus.isEnabled()) disqus.loadEmbed(window, session.resourceURL);

  // detect if modal window OR popup (page has parent)
  if (window.opener !== null || window.dialogArguments !== undefined) {
    document.querySelector('form').setAttribute('action', '?from_bookmarklet=1');
  }
});
