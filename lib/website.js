var url = require('url');
var JSONStream = require('JSONStream');
var _ = require('underscore');

var makeapi = require('./makeapi');
var weblitmap = require('./weblitmap');
var bookmarklet = require('./bookmarklet');
var settings = require('./public-settings');
var WeblitStream = require('./weblit-stream');

var WEBMAKER_URL = settings.WEBMAKER_URL;
var WEBMAKER_DOMAIN = url.parse(WEBMAKER_URL).hostname;

function getMake(req, res, next) {
  var url = req.query.url || req.body.url;
  req.make = null;
  if (!url) return next();

  makeapi.makeForURL(url, function(err, make) {
    if (err) return next(new Error('make api read failure'));
    req.make = make;
    next();
  });
}

function likeOperation(method) {
  return function(req, res, next) {
    var api = makeapi.getAPI();
    api[method](req.params.id, req.session.username, function(err) {
      if (err) return next(err);
      return res.send(method + ' successful');
    });
  };
}

function needsLogin(req, res, next) {
  if (req.session.email && req.session.username) return next();
  return next(401);
}

exports.WEBMAKER_URL = WEBMAKER_URL;
exports.WEBMAKER_DOMAIN = WEBMAKER_DOMAIN;

exports.express = function(app, options) {
  app.locals.WEBMAKER_URL = WEBMAKER_URL;
  app.locals.WEBMAKER_DOMAIN = WEBMAKER_DOMAIN;

  app.get('/', function(req, res, next) {
    return res.render('index.html', {
      bookmarklet: new res.render.SafeString(bookmarklet(options.origin)),
      filter: req.query.filter,
      tags: _.values(weblitmap.tags).filter(function(cat) {
        return (cat.type == 'strand' || cat.type == 'competency');
      }).map(function(cat) { return cat.tag; })
    });
  });

  app.get('/json', function(req, res, next) {
    if ('download' in req.query) {
      var today = new Date().toISOString().split('T')[0]
      res.set('Content-Disposition', 'attachment; ' +
              'filename=weblitmapper-' + today + '.json');
    }
    res.type('application/json');
    WeblitStream().pipe(JSONStream.stringify()).pipe(res);
  });

  app.post('/:id/like', needsLogin, likeOperation('like'));
  app.post('/:id/unlike', needsLogin, likeOperation('unlike'));

  app.post('/update', needsLogin, getMake, function(req, res, next) {
    var form = new makeapi.MakeForm(req.body);
    var errors = form.validate();

    errors.forEach(function(error) { req.flash('danger', error); });

    if (errors.length)
      return res.redirect('back');

    form.createOrUpdate(req.make, req.session.email, function(err) {
      if (err) return next(new Error('make api write failure'));
      req.flash('success', 'Submission successful. Thanks!');
      return res.redirect('/');
    });
  });

  app.get('/update', getMake, function(req, res, next) {
    if (!req.query.url)
      return res.redirect('/');
    if (!req.session.email)
      req.flash('warning', 'Please login before submitting this form.');
    else if (!req.session.username)
      req.flash('warning', new res.render.SafeString(
        'Please create an account for ' + _.escape(req.session.email) +
        ' at <a href="' + WEBMAKER_URL + '">' + WEBMAKER_DOMAIN + '</a> ' +
        'before submitting this form.'
      ));
    var form = new makeapi.MakeForm(req.query);

    if (req.make) form.loadFrom(req.make);

    return res.render('update.html', {
      weblitmap: weblitmap,
      isUpdate: !!req.make,
      entry: form
    });
  });
};
