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

function updateCSP(policies) {
  if (!settings.DISQUS_SHORTNAME) return;

  var protocol = urlParse(settings.ORIGIN).protocol;
  policies['script-src'].push(
    protocol + '//' + settings.DISQUS_SHORTNAME + '.disqus.com',
    protocol + '//go.disqus.com'
  );
  policies['frame-src'].push(protocol + '//disqus.com');
}

module.exports.updateCSP = updateCSP;
module.exports.settingsForResource = settingsForResource;
