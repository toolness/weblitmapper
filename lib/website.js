var makeapi = require('./makeapi');
var weblitmap = require('./weblitmap');

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

    if (!req.session.email)
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
    var form = new makeapi.MakeForm(req.query);

    if (req.make) form.loadFrom(req.make);

    return res.render('update.html', {
      weblitmap: weblitmap,
      entry: form
    });
  });
};
