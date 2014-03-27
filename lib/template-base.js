exports.buildEnvironment = function(nunjucks, loaders) {
  var env = new nunjucks.Environment(loaders, {autoescape: true});

  return env;
};
