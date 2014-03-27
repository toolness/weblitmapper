var prettyDate = require('./pretty-date');

exports.buildEnvironment = function(nunjucks, loaders) {
  var env = new nunjucks.Environment(loaders, {autoescape: true});

  env.addFilter('prettyDate', prettyDate);

  return env;
};
