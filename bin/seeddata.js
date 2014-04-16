var readline = require('readline');
var async = require('async');

var db = require('../test/db');

var dbName = 'mongodb://' + db.db.serverConfig.host + ':' +
             db.db.serverConfig.port + '/' + db.db.databaseName;

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("WARNING: This will wipe all data in " + dbName +
            " and replace it with sample data.");

rl.question("Are you sure you want to continue? ", function(answer) {
  if (answer.trim().toLowerCase() != "yes") {
    console.log("You did not respond with 'yes', so I will abort.");
    process.exit(1);
  }

  async.series([
    db.wipe,
    db.loadFixture(require('../test/fixture/weblit-resources.json'))
  ], function(err) {
    if (err) throw err;
    console.log("Done.");
    process.exit(0);
  });
});
