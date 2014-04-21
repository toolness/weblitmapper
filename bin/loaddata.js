var fs = require('fs');
var readline = require('readline');
var async = require('async');

var db = require('../test/db');

var dbName = 'mongodb://' + db.db.serverConfig.host + ':' +
             db.db.serverConfig.port + '/' + db.db.databaseName;

var filename = process.argv[2];

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

if (!filename) {
  console.error('usage: loaddata.js <filename>');
  process.exit(1);
}

if (!fs.existsSync(filename)) {
  console.error('The file "' + filename + '" does not exist.');
  process.exit(1);
}

console.log("WARNING: This will wipe all data in " + dbName +
            " and replace it with the data in " + filename + ".");

rl.question("Are you sure you want to continue? ", function(answer) {
  if (answer.trim().toLowerCase() != "yes") {
    console.log("You did not respond with 'yes', so I will abort.");
    process.exit(1);
  }

  async.series([
    db.wipe,
    db.loadFixture(filename)
  ], function(err) {
    if (err) throw err;
    console.log("Done.");
    db.close();
    rl.close();
  });
});
