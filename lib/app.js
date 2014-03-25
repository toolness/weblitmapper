var url = require('url');
var express = require('express');
var clientSessions = require('client-sessions');

var paths = require('./paths');
var template = require('./template');
var persona = require('./persona');
var securityHeaders = require('./security-headers');
var getUsernameForEmail = require('./email-to-username');
var website = require('./website');

exports.build = function(options) {
  var app = express();

  app.use(securityHeaders({
    enableHSTS: url.parse(options.origin).protocol == 'https:',
    staticRoot: options.staticRoot
  }));

  app.use(express.json());
  app.use(express.urlencoded());
  app.use(clientSessions({
    cookieName: 'session',
    secret: options.cookieSecret,
    duration: options.cookieDuration ||
              24 * 60 * 60 * 1000, // defaults to 1 day
  }));
  app.use(express.csrf());
  template.express(app, {
    debug: options.debug,
    staticRoot: options.staticRoot,
    extraTemplateLoaders: options.extraTemplateLoaders
  });
  app.use(getUsernameForEmail.middleware);

  if (options.defineExtraMiddleware) options.defineExtraMiddleware(app);

  app.use(app.router);

  if (options.debug && options.writeBundle)
    app.get('/js/bundle.js', function(req, res) {
      res.type('application/javascript');
      return options.writeBundle(res, {logErrors: true});
    });

  persona.express(app, {
    audience: options.origin,
    jsUrl: options.personaJsUrl,
    defineRoutes: options.personaDefineRoutes
  });

  website.express(app, {origin: options.origin});

  if (options.defineExtraRoutes) options.defineExtraRoutes(app);

  app.use(express.static(paths.staticDir));
  if (options.debug)
    app.use('/test', express.static(paths.staticTestDir));

  app.use(function(err, req, res, next) {
    if (typeof(err) == 'number')
      return res.type('text/plain').send(err);
    if (typeof(err.status) == 'number')
      return res.type('text/plain').send(err.status, err.message);
    process.stderr.write(err.stack);
    res.type('text')
      .send(500, options.debug ? err.stack : 'Sorry, something exploded!');
  });

  return app;
};
