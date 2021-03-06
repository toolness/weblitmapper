var _ = require('underscore');
var nunjucks = require('nunjucks');
var flash = require('connect-flash');

var paths = require('./paths');
var buildEnvironment = require('./template-base').buildEnvironment;
var settings = require('./public-settings');

function flashList(req) {
  var flash = req.flash();
  var messages = [];
  Object.keys(flash).forEach(function(category) {
    messages.push.apply(messages, flash[category].map(function(content) {
      return {category: category, content: content};
    }));
  });
  return messages;
}

exports.express = function(app, options) {
  var loaders = [];
  var nunjucksEnv;

  loaders.push(new nunjucks.FileSystemLoader(paths.templateDir));
  if (options.extraTemplateLoaders)
    loaders.push.apply(loaders, options.extraTemplateLoaders);

  nunjucksEnv = buildEnvironment(nunjucks, loaders);

  _.extend(app.locals, {
    DISQUS_SHORTNAME: settings.DISQUS_SHORTNAME,
    DOT_MIN: options.debug ? '' : '.min',
    STATIC_ROOT: options.staticRoot || ''
  });
  app.use(flash());
  app.nunjucksEnv = nunjucksEnv;
  nunjucksEnv.express(app);
  app.response.render.SafeString = nunjucks.runtime.SafeString;
  app.use(function setResponseLocals(req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    res.locals.username = req.session.username || '';
    res.locals.userId = req.session.userId || '';
    res.locals.emailHash = req.session.emailHash || '';
    res.locals.fetchAndClearFlashMessages = flashList.bind(null, req);
    next();
  });
};
