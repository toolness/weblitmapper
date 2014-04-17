var fs = require('fs');
var crypto = require('crypto');
var path = require('path');
var _ = require('underscore');
var through = require('through');
var request = require('request');
var async = require('async');
var JSONStream = require('JSONStream');

var WeblitStream = require('../lib/weblit-stream');

var CACHE_FILENAME = 'staging-usernames-to-production.cache.json';

var PROD_URL = 'https://login.webmaker.org';
var PROD_USERNAME = process.argv[2];
var PROD_PASSWORD = process.argv[3];

var STAGING_URL = process.env.LOGINAPI_URL;
var STAGING_USERNAME = (process.env.LOGINAPI_AUTH || '').split(':')[0];
var STAGING_PASSWORD = (process.env.LOGINAPI_AUTH || '').split(':')[1];

function md5(str) {
  var md5sum = crypto.createHash('md5');
  md5sum.update(str);
  return md5sum.digest('hex')
}

function hashEmail(email) {
  return md5(email.toLowerCase().trim());
}

function getEmailForStagingUsernameOrId(username, cb) {
  var urlPath = typeof(username) == 'string' ? '/user/username/'
                                             : '/user/id/';
  request({
    url: STAGING_URL + urlPath + username,
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
      return cb(null, body.user.email, body.user.username, body.user.id);
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

function stagingUsernameAndIdToEmailMapper(cache) {
  return through(function(make) {
    var self = this;
    var username = make.username;

    function processLikes() {
      make.email = cache[username];
      async.mapSeries(make.likes, function(id, cb) {
        if (id in cache) return cb(null, cache[id]);
        getEmailForStagingUsernameOrId(id, function(err, email, username) {
          if (err) return cb(err);
          cache[username] = cache[id] = email;
          cb(null, cache[id]);
        });
      }, function(err, emailLikes) {
        if (err) return self.emit('error', err);
        make.emailLikes = emailLikes;
        self.queue(make);
      });
    }

    if (username in cache) return processLikes();
    getEmailForStagingUsernameOrId(username, function(err, email, _, id) {
      if (err) return self.emit('error', err);
      cache[username] = cache[id] = email;
      processLikes();
    });
  });
}

function emailToProdUsernameMapper(cache) {
  return through(function(make) {
    var self = this;

    function processLikes() {
      make.productionUsername = cache[make.email];
      async.mapSeries(make.emailLikes, function(email, cb) {
        function success(username) {
          if (!username) {
            console.error('no production username for ' +
                          email + ', featured in a like');

            return cb(null, null);
          }
          cb(null, {
            username: username,
            emailHash: hashEmail(email)
          });
        }

        if (email in cache) return success(cache[email]);
        getProdUsernameForEmail(email, function(err, username) {
          if (err) return cb(err);
          cache[email] = username;
          success(cache[email]);
        });
      }, function(err, productionLikes) {
        if (err) return self.emit('error', err);
        make.productionLikes = productionLikes.filter(function(like) {
          return !!like;
        });
        self.queue(make);
      });
    }

    if (make.email in cache) return processLikes();
    getProdUsernameForEmail(make.email, function(err, username) {
      if (err) return self.emit('error', err);
      cache[make.email] = username;
      processLikes();
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
    'for more information).',
    '',
    'The file ' + CACHE_FILENAME + ' will be used to store',
    'cached data. Feel free to modify or delete it.'
  ].join('\n'));

  process.exit(1);
}

if (!(PROD_USERNAME && PROD_PASSWORD &&
      STAGING_URL && STAGING_USERNAME && STAGING_PASSWORD))
  showHelpAndExit();

var cache = {
  staging: {},
  production: {}
};

if (fs.existsSync(CACHE_FILENAME))
  cache = JSON.parse(fs.readFileSync(CACHE_FILENAME, 'utf-8'));

WeblitStream()
  .pipe(stagingUsernameAndIdToEmailMapper(cache.staging))
  .pipe(emailToProdUsernameMapper(cache.production))
  .on('data', function(make) {
    if (!make.productionUsername)
      console.error('no production username for ' + make.username +
                    ' (' + make.email + ')');
  })
  .on('end', function() {
    fs.writeFileSync(CACHE_FILENAME,
                     JSON.stringify(cache, null, 2), 'utf-8');
  })
  .pipe(through(function(make) {
    var newMake = _.pick(make, 'title', 'url', 'description',
                         'emailHash', 'createdAt', 'tags');
    newMake.likes = make.productionLikes;
    newMake.username = make.productionUsername;
    newMake.model = "WeblitResource";
    this.queue(newMake);
  }))
  .pipe(JSONStream.stringify())
  .pipe(process.stdout);
