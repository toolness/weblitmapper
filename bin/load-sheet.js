var url = require('url');
var path = require('path');
var fs = require('fs');
var assert = require('assert');

var GoogleSpreadsheet = require('google-spreadsheet');

function loadJSONFile(filename, cb) {
  var updated = fs.statSync(filename).mtime.toISOString();
  var rows = JSON.parse(fs.readFileSync(filename, 'utf-8'));
  var FakeSheet = require('../test/lib/fake-sheet');

  process.nextTick(function() {
    cb(null, new FakeSheet(rows, updated));
  });
}

function loadGoogleSpreadsheet(sheetInfo, cb) {
  var sheet = new GoogleSpreadsheet(sheetInfo.query.key);

  if (sheetInfo.auth) {
    var auth = sheetInfo.auth.split(':');

    sheet.setAuth(auth[0], auth[1], function(err) { cb(err, sheet); });
  } else
    cb(null, sheet);
}

function loadSheet(sheetURL, cb) {
  var sheetInfo = url.parse(sheetURL, true);

  if (sheetInfo.protocol == 'https:' &&
      sheetInfo.host == 'docs.google.com' &&
      'key' in sheetInfo.query) {
    loadGoogleSpreadsheet(sheetInfo, cb);
  } else if (!sheetInfo.protocol &&
             /\.json$/.test(sheetInfo.path)) {
    loadJSONFile(sheetInfo.path, cb);
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

          Object.keys(row).forEach(function(field) {
            if (field[0] == '_' ||
                field == 'id' ||
                field == 'title' ||
                field == 'content') return;
            newRow[field] = row[field];
          });

          return newRow;
        });

        console.log(JSON.stringify(rows, null, 2));
      });
    });
  });
}
