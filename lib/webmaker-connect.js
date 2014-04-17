var OAuth = require('oauth').OAuth;

var WMCONNECT_ORIGIN = process.env.WMCONNECT_ORIGIN ||
                       'https://webmakerconnect.org';
var WMCONNECT_API_KEY = process.env.WMCONNECT_API_KEY;
var WMCONNECT_API_SECRET = process.env.WMCONNECT_API_SECRET;

function express(app, options) {
  var origin = options.origin;
  var staticRoot = options.staticRoot;

  function oauthClient() {
    return new OAuth(
      WMCONNECT_ORIGIN + '/api/oauth/request_token',
      WMCONNECT_ORIGIN + '/api/oauth/access_token',
      WMCONNECT_API_KEY,
      WMCONNECT_API_SECRET,
      '1.0A',
      origin + '/wmconnect/callback',
      'HMAC-SHA1'
    );
  }

  app.get('/wmconnect/login', function(req, res, next) {
    // TODO: If we're already logged in, short circuit all this?
    oauthClient().getOAuthRequestToken(function(err, token, secret) {
      if (err) return next(err);
      req.session.request_token = token;
      req.session.request_token_secret = secret;
      return res.redirect(WMCONNECT_ORIGIN + '/authorize?oauth_token=' +
                          token);
    });
  });

  app.get('/wmconnect/callback', function(req, res, next) {
    var token = req.param('oauth_token');
    var verifier = req.param('oauth_verifier');

    if (token != req.session.request_token)
      return res.send('token mismatch');

    oauthClient().getOAuthAccessToken(
      req.session.request_token,
      req.session.request_token_secret,
      verifier,
      function(err, access_token, access_token_secret, results) {
        if (err)
          return res.type('text/plain').send(util.inspect(err));
        delete req.session.request_token;
        delete req.session.request_token_secret;
        req.session.access_token = access_token;
        req.session.access_token_secret = access_token_secret;
        req.session.username = results.username;
        req.session.userId = results.userId;
        req.session.emailHash = results.emailHash;
        return res.send('<!DOCTYPE html><script src="' +
                        staticRoot + '/js/wmconnect-callback.js"></script>');
      }
    );
  });

  app.post('/wmconnect/logout', function(req, res, next) {
    Object.keys(req.session).forEach(function(key) {
      delete req.session[key];
    });
    return res.send('logged out');
  });
}

exports.express = express;
