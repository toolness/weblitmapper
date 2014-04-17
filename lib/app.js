var url = require('url');
var express = require('express');
var clientSessions = require('client-sessions');

var paths = require('./paths');
var template = require('./template');
var writeBundle = require('./write-bundle');
var securityHeaders = require('./security-headers');
var webmakerConnect = require('./webmaker-connect');
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

  if (options.defineExtraMiddleware) options.defineExtraMiddleware(app);

  app.use(app.router);

  if (options.debug)
    app.get(writeBundle.URL, function(req, res) {
      res.type('application/javascript');
      return writeBundle({debug: true}).pipe(res);
    });

  webmakerConnect.express(app, {
    origin: options.origin,
    staticRoot: options.staticRoot
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
    var stack = err.stack || err.toString();
    process.stderr.write(stack);
    res.type('text')
      .send(500, options.debug ? stack : 'Sorry, something exploded!');
  });

  return app;
};
