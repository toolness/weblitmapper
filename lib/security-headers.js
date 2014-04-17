var urlParse = require('url').parse;
var disqus = require('./browser/disqus');

function securityHeaders(options) {
  var staticOrigin = null;

  if (options.staticRoot) {
    staticOrigin = urlParse(options.staticRoot);
    staticOrigin = staticOrigin.protocol + '//' + staticOrigin.host;
  }

  return function(req, res, next) {
    res.set('X-Frame-Options', 'DENY');
    res.set('X-Content-Type-Options', 'nosniff');
    if (options.enableHSTS)
      res.set('Strict-Transport-Security',
              'max-age=31536000; includeSubDomains');

    addContentSecurityPolicy(req, res, staticOrigin);
    next();
  };
}

function addContentSecurityPolicy(req, res, staticOrigin) {
  var policies = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'"
    ],
    'frame-src': [],
    'style-src': ["'self'", "'unsafe-inline'",
                  "https://fonts.googleapis.com",
                  "https://netdna.bootstrapcdn.com"],
    'font-src': ["'self'", "https://themes.googleusercontent.com",
                 "https://netdna.bootstrapcdn.com"],
    'img-src': ['*'],
    'connect-src': ["'self'"],
    // options is deprecated, but Firefox still needs it.
    'options': []
  };
  if (req.path == '/test/') {
    // Some of our testing tools, e.g. sinon, use eval(), so we'll
    // enable it for this one endpoint.
    policies['script-src'].push("'unsafe-eval'");
    policies['options'].push('eval-script');
  }
  if (staticOrigin) {
    policies['script-src'].push(staticOrigin);
    policies['style-src'].push(staticOrigin);
  }
  if (disqus.isEnabled()) disqus.updateCSP(policies);
  var directives = [];
  Object.keys(policies).forEach(function(directive) {
    directives.push(directive + ' ' + policies[directive].join(' '));
  });
  var policy = directives.join('; ');
  res.set('Content-Security-Policy', policy);
  res.set('X-Content-Security-Policy', policy);
  res.set('X-WebKit-CSP', policy);
}

module.exports = securityHeaders;
