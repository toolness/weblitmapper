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

exports.express = function(app, options) {
  app.get('/', function(req, res) {
    getFormSheet({
      sheet: options.sheet,
      fields: SHEET_FIELDS,
      email: req.session.email
    }, function(err, formSheet) {
      if (err) return res.send(500, 'cannot access spreadsheet');
      return res.render('directory.html', {
        sheet: formSheet
      });
    });
  });
};
