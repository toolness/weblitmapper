var _ = require('underscore');

var urlParse = require('url').parse;
var settings = require('../public-settings');

function settingsForResource(url) {
  return {
    disqus_shortname: settings.DISQUS_SHORTNAME,
    disqus_identifier: 'weblit_' + url,
    disqus_url: settings.DISQUS_ORIGIN + '/update?url=' +
                encodeURIComponent(url)
  }
}

function isEnabled() {
  return !!settings.DISQUS_SHORTNAME;
}

function loadEmbed(window, resourceURL) {
  var document = window.document;
  _.extend(window, settingsForResource(resourceURL));

  // http://help.disqus.com/customer/portal/articles/565624-tightening-your-disqus-integration

  var dsq = document.createElement('script');
  dsq.type = 'text/javascript';
  dsq.async = true;
  dsq.src = '//' + window.disqus_shortname + '.disqus.com/embed.js';
  (document.getElementsByTagName('head')[0] ||
   document.getElementsByTagName('body')[0]).appendChild(dsq);
}

function updateCSP(policies) {
  var protocol = urlParse(settings.ORIGIN).protocol;
  policies['script-src'].push(
    protocol + '//' + settings.DISQUS_SHORTNAME + '.disqus.com',
    protocol + '//go.disqus.com'
  );
  policies['frame-src'].push(protocol + '//disqus.com');
}

module.exports.updateCSP = updateCSP;
module.exports.settingsForResource = settingsForResource;
module.exports.loadEmbed = loadEmbed;
module.exports.isEnabled = isEnabled;
