(function() {
  var _ = require('underscore');
  var session = require('./lib/browser/session');
  var disqus = require('./lib/browser/disqus');

  _.extend(window, disqus.settingsForResource(session.resourceURL));

  // http://help.disqus.com/customer/portal/articles/565624-tightening-your-disqus-integration

  var dsq = document.createElement('script');
  dsq.type = 'text/javascript';
  dsq.async = true;
  dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
  (document.getElementsByTagName('head')[0] ||
   document.getElementsByTagName('body')[0]).appendChild(dsq);
})();
