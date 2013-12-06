var getFormSheet = require('./form-sheet');

exports.express = function(app, options) { 
  function anonFormSheet(req, res, next) {
    getFormSheet({sheet: options.sheet}, function(err, formSheet) {
      if (err) return next(new Error('cannot access spreadsheet'));
      req.formSheet = formSheet;
      next();
    });
  }

  function authFormSheet(req, res, next) {
    getFormSheet({
      sheet: options.sheet,
      email: req.session.email
    }, function(err, formSheet) {
      if (err) return next(new Error('cannot access spreadsheet'));
      req.formSheet = formSheet;
      next();
    });
  }

  app.get('/', authFormSheet, function(req, res) {
    return res.render('directory.html', {sheet: req.formSheet});
  });

  app.post('/edit', authFormSheet, function(req, res, next) {
    var rowId = parseInt(req.body.id);
    var row = req.formSheet.rows[rowId];

    if (!row) return next(409);
    if (!row.isEditable) return next(403);

    delete req.body.id;
    delete req.body._csrf;

    Object.keys(req.body).forEach(function(name) {
      var column = row.column(name);
      if (column) column.value = req.body[name];
    });

    row.save(function(err) {
      if (err) return next(err);
      req.flash('success', 'Your changes were successfully saved.');
      return res.redirect('back');
    });
  });

  app.get('/embed.js', anonFormSheet, function(req, res) {
    res.render('directory-embedded.html', {
      sheet: req.formSheet
    }, function(err, html) {
      if (err) return next(err);
      res.render('directory-embedded.js', {
        htmlString: new res.render.SafeString(JSON.stringify(html))
      }, function(err, js) {
        if (err) return next(err);
        res.type('.js').send(js);
      });
    });
  });
};
