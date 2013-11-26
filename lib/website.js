var getFormSheet = require('./form-sheet');

var SHEET_FIELDS = [
  'Name of Organization',
  'URL',
  'Contact 1',
  'Contact 2',
  'Contact 3',
  'Other Contacts',
  'Mailing Address',
  'Facebook',
  'Twitter',
  'Blog',
  'YouTube',
  'Flickr',
  'Other Social Content Channels',
  'Youth Audience',
  'Hive Member Since',
  'Organizational Mission'
];

exports.SHEET_FIELDS = SHEET_FIELDS;

exports.express = function(app, options) {
  function formSheet(req, res, next) {
    getFormSheet({
      sheet: options.sheet,
      fields: SHEET_FIELDS,
      email: req.session.email
    }, function(err, formSheet) {
      if (err) return next(new Error('cannot access spreadsheet'));
      req.formSheet = formSheet;
      next();
    });
  }

  app.get('/', formSheet, function(req, res) {
    return res.render('directory.html', {
      sheet: req.formSheet,
      org: req.formSheet.editableRow
           ? req.formSheet.editableRow.val('Name of Organization')
           : null
    });
  });

  app.post('/edit', formSheet, function(req, res, next) {
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
};
