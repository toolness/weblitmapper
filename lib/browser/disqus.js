var _ = require('underscore');

var urlParse = require('url').parse;
var settings = require('../public-settings');

function baseSettings() {
  return {
    disqus_shortname: settings.DISQUS_SHORTNAME
  };
}

function settingsForResource(url) {
  return _.extend(baseSettings(), {
    disqus_identifier: 'weblit_' + url,
    disqus_url: settings.DISQUS_ORIGIN + '/update?url=' +
                encodeURIComponent(url)
  });
}

function isEnabled() {
  return !!settings.DISQUS_SHORTNAME;
}

function scriptURL(filename) {
  return '//' + settings.DISQUS_SHORTNAME + '.disqus.com/' + filename;
}

function loadScript(window, filename) {
  // http://help.disqus.com/customer/portal/articles/565624-tightening-your-disqus-integration

  var document = window.document;
  var dsq = document.createElement('script');
  dsq.type = 'text/javascript';
  dsq.async = true;
  dsq.src = scriptURL(filename);
  (document.getElementsByTagName('head')[0] ||
   document.getElementsByTagName('body')[0]).appendChild(dsq);
}

function loadEmbed(window, resourceURL) {
  _.extend(window, settingsForResource(resourceURL));
  loadScript(window, 'embed.js');
}

function loadCommentCount(window) {
  _.extend(window, baseSettings());
  loadScript(window, 'count.js');
}

function refreshCommentCount(window) {
  var document = window.document;
  var countURL = scriptURL('count.js');
  var script = document.querySelector('script[src="' + countURL + '"]');

  if (!script) return loadCommentCount(window);
  if (window.DISQUSWIDGETS) window.DISQUSWIDGETS.getCount();
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
module.exports.refreshCommentCount = refreshCommentCount;
module.exports.isEnabled = isEnabled;
