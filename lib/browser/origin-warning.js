var settings = require('../public-settings');
var template = require('./lib/browser/template');

function maybeShowOriginWarning(alerts) {
  if (settings.ORIGIN == location.protocol + '//' + location.host)
    return;

  var html = template.render('./template/browser/origin-warning.html', {
    origin: settings.ORIGIN
  });
  var warning = $(html).appendTo(alerts);
  warning.hide().slideDown();
}

module.exports = maybeShowOriginWarning;
