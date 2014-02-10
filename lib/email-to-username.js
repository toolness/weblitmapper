var request = require('request');

function getUsernameForEmail(email, cb) {
  var baseURL = process.env.LOGINAPI_URL || 'https://login.webmaker.org';
  var auth = process.env.LOGINAPI_AUTH.split(':');

  if (baseURL == ':fake:') return fakeUsernameForEmail(email, cb);

  request({
    url: baseURL + '/user/email/' + email,
    auth: {
      user: auth[0],
      pass: auth[1],
      sendImmediately: true
    }
  }, function(err, res, body) {
    if (err) return cb(err);
    if (res.statusCode == 404) {
      return cb(null, null);
    } else if (res.statusCode == 200) {
      body = JSON.parse(body);
      return cb(null, body.user.username);
    }
    return cb(new Error('unexpected status code: ' +
                        res.statusCode));
  });
}

function fakeUsernameForEmail(email, cb) {
  process.nextTick(function() {
    var username = email.split('@')[0];
    cb(null, username);
  });
}

function getUsernameMiddleware(req, res, next) {
  function ready() {
    res.locals.username = req.session.username;
    next();
  }

  if (req.session.email) {
    if (!req.session.username)
      return getUsernameForEmail(req.session.email, function(err, username) {
        if (err) return next(new Error('login api read failure'));
        req.session.username = username;
        ready();
      });
  } else req.session.username = null;
  ready();
}

module.exports = getUsernameForEmail;
module.exports.middleware = getUsernameMiddleware;

if (!module.parent) {
  var email = process.argv[2];
  getUsernameForEmail(email, function(err, username) {
    if (err) throw err;
    console.log('username for', email, 'is', username);
  });
}
