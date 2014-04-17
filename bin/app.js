#!/usr/bin/env node

var fs = require('fs');
var url = require('url');
var assert = require('assert');

const PORT = process.env['PORT'] || 3000;
const COOKIE_SECRET = process.env['COOKIE_SECRET'] || null;
const DEBUG = ('DEBUG' in process.env);
const SSL_KEY = process.env['SSL_KEY'];
const SSL_CERT = process.env['SSL_CERT'];
const ORIGIN = process.env['ORIGIN'] || (DEBUG
  ? (SSL_KEY ? 'https' : 'http') + '://localhost:' + PORT
  : null);
const STATIC_ROOT = process.env['STATIC_ROOT'] || '';

assert.ok(ORIGIN, 'ORIGIN env var should be defined.');
assert.ok(COOKIE_SECRET, 'COOKIE_SECRET env var should be defined.');
assert.ok((SSL_KEY && SSL_CERT) || (!SSL_KEY && !SSL_CERT),
          'if one of SSL_KEY or SSL_CERT is defined, the other must too.');
if (SSL_KEY)
  assert.equal(url.parse(ORIGIN).protocol, 'https:',
               'ORIGIN must be https if SSL is enabled.');

process.env['ORIGIN'] = ORIGIN;

function startServer() {
  var lib = require('../');
  var app = lib.app.build({
    cookieSecret: COOKIE_SECRET,
    debug: DEBUG,
    staticRoot: STATIC_ROOT,
    origin: ORIGIN
  });

  var server = app;

  if (SSL_KEY)
    server = require('https').createServer({
      key: fs.readFileSync(SSL_KEY),
      cert: fs.readFileSync(SSL_CERT)
    }, app);

  if (!DEBUG)
    lib.writeBundle({writeToFile: true});

  server.listen(PORT, function() {
    console.log("Origin set to " + ORIGIN +
                ".\nSite must be accessed through the above URL, or " +
                "login will fail.");
    console.log("Listening on port " + PORT + ".");
  });
}

startServer();
