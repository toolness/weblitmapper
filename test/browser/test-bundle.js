(function() {
  module("bundle");

  var template = require('./lib/browser/template');
  var settings = require('./lib/public-settings');

  test("origin-warning template works", function() {
    var templateName = './template/browser/origin-warning.html';
    ok(templateName in window.nunjucksPrecompiled,
       'precompiled template exists');
    var html = template.render(templateName, {origin: 'http://lol'});
    ok(html.indexOf('http://lol') != -1, '"http://lol" is in ' + html);
  });

  test("public settings are defined", function() {
    ok(window._SETTINGS_ENV, 'window._SETTINGS_ENV exists');
    ['WEBLIT_TAG_PREFIX', 'WEBMAKER_URL'].forEach(function(name) {
      ok(settings[name], 'settings.' + name + ' exists');
    });
  });
})();
