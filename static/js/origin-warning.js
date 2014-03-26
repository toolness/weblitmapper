$(window).load(function() {
  var settings = require('./lib/public-settings');
  var template = require('./lib/browser/template');
  var alerts = $("#alerts");

  if (settings.ORIGIN == location.protocol + '//' + location.host)
    return;

  var html = template.render('./template/browser/origin-warning.html', {
    origin: settings.ORIGIN
  });
  var warning = $(html).appendTo(alerts);
  warning.hide().slideDown();
});
