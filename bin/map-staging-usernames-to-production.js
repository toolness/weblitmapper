var path = require('path');
var through = require('through');
var request = require('request');
var JSONStream = require('JSONStream');

var WeblitStream = require('../lib/weblit-stream');

var PROD_URL = 'https://login.webmaker.org';
var PROD_USERNAME = process.argv[2];
var PROD_PASSWORD = process.argv[3];

var STAGING_URL = process.env.LOGINAPI_URL;
var STAGING_USERNAME = (process.env.LOGINAPI_AUTH || '').split(':')[0];
var STAGING_PASSWORD = (process.env.LOGINAPI_AUTH || '').split(':')[1];

function getEmailForStagingUsername(username, cb) {
  request({
    url: STAGING_URL + '/user/username/' + username,
    auth: {
      user: STAGING_USERNAME,
      pass: STAGING_PASSWORD,
      sendImmediately: true
    }
  }, function(err, res, body) {
    if (err) return cb(err);
    if (res.statusCode == 404) {
      return cb(new Error('username ' + username + ' not found'), null);
    } else if (res.statusCode == 200) {
      body = JSON.parse(body);
      return cb(null, body.user.email);
    }
    return cb(new Error('unexpected status code: ' +
                        res.statusCode));
  });
}

function getProdUsernameForEmail(email, cb) {
  var baseURL = PROD_URL;

  request({
    url: baseURL + '/user/email/' + email,
    auth: {
      user: PROD_USERNAME,
      pass: PROD_PASSWORD,
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

function stagingUsernameToEmailMapper() {
  var cache = {};

  return through(function(make) {
    var self = this;

    function queue() {
      make.email = cache[make.username];
      self.queue(make);
    }

    if (make.username in cache) return queue();
    getEmailForStagingUsername(make.username, function(err, email) {
      if (err) return self.emit('error', err);
      cache[make.username] = email;
      queue();
    });
  });
}

function emailToProdUsernameMapper() {
  var cache = {};

  return through(function(make) {
    var self = this;

    function queue() {
      make.productionUsername = cache[make.email];
      self.queue(make);
    }

    if (make.email in cache) return queue();
    getProdUsernameForEmail(make.email, function(err, username) {
      if (err) return self.emit('error', err);
      cache[make.email] = username;
      queue();
    });
  });  
}

function showHelpAndExit() {
  var scriptName = path.basename(process.argv[1]);

  console.error([
    'usage: ' + scriptName + ' <username> <password>',
    '',
    'This script will output a JSON array of makes, with "email" and ',
    '"productionUsername" fields set (though the latter may be null).',
    '',
    '<username> and <password> are the credentials to the production ',
    'login API at ' + PROD_URL + '.',
    '',
    'Also ensure that LOGINAPI_URL and LOGINAPI_AUTH point to a ',
    'staging or development instance of the login API (see README.md ',
    'for more information).'
  ].join('\n'));

  process.exit(1);
}

if (!(PROD_USERNAME && PROD_PASSWORD &&
      STAGING_URL && STAGING_USERNAME && STAGING_PASSWORD))
  showHelpAndExit();

WeblitStream()
  .pipe(stagingUsernameToEmailMapper())
  .pipe(emailToProdUsernameMapper())
  .on('data', function(make) {
    if (!make.productionUsername)
      console.error('no production username for ' + make.username +
                    ' (' + make.email + ')');
  })
  .pipe(JSONStream.stringify())
  .pipe(process.stdout);
