var makeapi = require('./makeapi');
var getUsernameForEmail = require('./email-to-username');
var weblitmap = require('./weblitmap');

function getUsername(req, res, next) {
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

exports.express = function(app, options) {
  app.get('/', function(req, res, next) {
    return res.render('index.html', {
      MAKEAPI_URL: makeapi.url
    });
  });

  app.post('/update', getMake, function(req, res, next) {
    var form = new makeapi.MakeForm(req.body);
    var errors = form.validate();

    errors.forEach(function(error) { req.flash('danger', error); });

    if (errors.length || !(req.session.email && req.session.username))
      return res.redirect('back');

    form.createOrUpdate(req.make, req.session.email, function(err) {
      if (err) return next(new Error('make api write failure'));
      req.flash('success', 'Submission successful. Thanks!');
      return res.redirect('/');
    });
  });

  app.get('/update', getMake, getUsername, function(req, res, next) {
    if (!req.query.url)
      return res.redirect('/');
    if (!req.session.email)
      req.flash('warning', 'Please login before submitting this form.');
    else if (!req.session.username)
      req.flash('warning', 'Please create a Webmaker account for ' +
                           req.session.email + ' before submitting ' +
                           'this form.');
    var form = new makeapi.MakeForm(req.query);

    if (req.make) form.loadFrom(req.make);

    return res.render('update.html', {
      weblitmap: weblitmap,
      entry: form
    });
  });
};
