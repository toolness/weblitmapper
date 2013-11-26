var url = require('url');
var path = require('path');
var assert = require('assert');

var GoogleSpreadsheet = require('google-spreadsheet');
var squishName = require('../').util.squishName;
var SHEET_FIELDS = require('../').website.SHEET_FIELDS;

assert.ok(SHEET_FIELDS && squishName);

function loadSheet(sheetURL, cb) {
  var sheetInfo = url.parse(sheetURL, true);

  if (sheetInfo.protocol == 'https:' &&
      sheetInfo.host == 'docs.google.com' &&
      'key' in sheetInfo.query) {
    var sheet = new GoogleSpreadsheet(sheetInfo.query.key);

    if (sheetInfo.auth) {
      var auth = sheetInfo.auth.split(':');

      sheet.setAuth(auth[0], auth[1], function(err) { cb(err, sheet); });
    } else
      cb(null, sheet);
  } else
    cb(new Error('Unknown spreadsheet URL: ' + sheetURL));
}

module.exports = loadSheet;

if (!module.parent) {
  var sheetURL = process.argv[2];
  var scriptName = path.basename(process.argv[1]);

  if (!sheetURL) {
    console.error('usage: ' + scriptName + ' <spreadsheet-url>');
    process.exit(1);
  }

  loadSheet(sheetURL, function(err, sheet) {
    if (err) throw err;

    sheet.getInfo(function(err, info) {
      if (err) throw err;

      info.worksheets[0].getRows(function(err, rows) {
        if (err) throw err;

        rows = rows.map(function(row) {
          var newRow = {};

          SHEET_FIELDS.forEach(function(field) {
            var squished = squishName(field);

            if (squished in row) newRow[squished] = row[squished];
          });

          return newRow;
        });

        console.log(JSON.stringify(rows, null, 2));
      });
    });
  });
}
