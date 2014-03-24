var csvrow = require('csvrow');
var fs = require('fs');
var rows;

if (!process.argv[2]) {
  console.error('usage: node csv-to-json.js <csv-file>');
  process.exit(1);
}

rows = fs.readFileSync(process.argv[2], 'utf-8')
  .split('\n').map(function(row) {
    return csvrow.parse(row.trim());
  });

console.log(JSON.stringify(rows));
