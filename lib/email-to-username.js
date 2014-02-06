var request = require('request');

function getUsernameForEmail(email, cb) {
  var auth = process.env.LOGINAPI_AUTH.split(':');
  var baseURL = process.env.LOGINAPI_URL || 'https://login.webmaker.org';
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

module.exports = getUsernameForEmail;

if (!module.parent) {
  var email = process.argv[2];
  getUsernameForEmail(email, function(err, username) {
    if (err) throw err;
    console.log('username for', email, 'is', username);
  });
}
