var url = require('url');

var prettyDate = require('./pretty-date');

exports.simplifyUrl = function simplifyUrl(aUrl) {
  var parsedURL = url.parse(aUrl);
  return parsedURL.hostname +
         (parsedURL.pathname == '/' ? '' : parsedURL.pathname);
};

exports.buildEnvironment = function(nunjucks, loaders) {
  var env = new nunjucks.Environment(loaders, {autoescape: true});

  env.addFilter('prettyDate', prettyDate);
  env.addFilter('simplifyUrl', exports.simplifyUrl);

  return env;
};
