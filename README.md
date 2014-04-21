# Web Literacy Mapper [![Build Status](https://secure.travis-ci.org/toolness/weblitmapper.png?branch=master)](http://travis-ci.org/toolness/weblitmapper)

This is an attempt to make it easy to submit web resources that
are on the [Web Literacy Map](https://webmaker.org/standard)
to the Webmaker community via a bookmarklet.

## Prerequisites

Node 0.10.

MongoDB 2.4.

[PhantomJS][] 1.8 or later is used to automatically run the
browser-side tests from the command-line, but this can be optionally
disabled.

## Quick Start

First, go to http://webmakerconnect.org and set up an app for yourself.

```
git clone git://github.com/toolness/weblitmapper.git
cd weblitmapper
npm install
npm test
source .env.example
export WMCONNECT_API_KEY='your Webmaker Connect API key goes here'
export WMCONNECT_API_SECRET='your Webmaker Connect API secret goes here'
node bin/migrate.js
node bin/app.js
```

Then visit http://localhost:3000.

## Environment Variables

**Note:** When an environment variable is described as representing a
boolean value, if the variable exists with *any* value (even the empty
string), the boolean is true; otherwise, it's false.

* `MONGODB_URL` is the URL to the MongoDB instance. If not present,
  `mongodb://localhost/weblitmapper` is used.

* `WMCONNECT_API_KEY` is your Webmaker Connect API key.

* `WMCONNECT_API_SECRET` is your Webmaker Connect API secret.

* `WMCONNECT_ORIGIN` is the origin of the Webmaker Connect website. Defaults
  to `https://webmakerconnect.org`.

* `WEBMAKER_URL` is the URL for the user-facing Webmaker site. It will
  be used for display purposes only, as a means to direct users to
  create an account there if necessary, as well as other sundry
  off-site links. Defaults to https://webmaker.org.

* `COOKIE_SECRET` is the secret used to encrypt and sign cookies,
  to prevent tampering.

* `DEBUG` represents a boolean value. Setting this to true makes the server
  use unminified source code on the client-side, among other things.

* `ORIGIN` is the origin of the server, as it appears
  to users. If `DEBUG` is enabled, this defaults to
  `http://localhost:PORT`. Otherwise, it must be defined.

* `PORT` is the port that the server binds to. Defaults to 3000.

* `SSL_KEY` is the path to a private key to use for SSL. If this
  is provided, the server must be accessed over HTTPS rather
  than HTTP, and the `SSL_CERT` environment variable must also
  be defined.

* `SSL_CERT` is the path to a SSL certificate. If this
  is provided, the server must be accessed over HTTPS rather
  than HTTP, and the `SSL_KEY` environment variable must also
  be defined.

* `STATIC_ROOT` is a URL pointing to the location of static assets. If
  not provided, the app will self-host its own static assets. Note that
  this URL should *not* end with a `/`.

* `DISQUS_SHORTNAME` is the shortname for your Disqus instance, if one
  exists. If this environment variable is empty or undefined, Disqus
  integration will be disabled.

* `DISQUS_ORIGIN` is the origin of your website as provided to Disqus.
  This defaults to `ORIGIN`, but if you want to display your
  production instance's actual comments on your local machine, you
  can set this to the origin of your production instance.

## Tests

All tests can be run via `npm test`.

Individual test suites can be run via
<code>node_modules/.bin/mocha test/<em>filename</em></code>, where
*filename* is the name of the test. See [mocha(1)][] for more options.

By default, PhantomJS is used to run the browser-side tests, but they
can be skipped if the `DISABLE_PHANTOM_TESTS` environment variable is
defined.

### Test Coverage

Build/install [jscoverage][], run `make test-cov`, then open
`coverage.html` in a browser.

  [PhantomJS]: http://phantomjs.org/
  [mocha(1)]: http://visionmedia.github.io/mocha/#usage
  [jscoverage]: https://github.com/visionmedia/node-jscoverage
