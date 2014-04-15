var mongoose = require('mongoose');

var DEFAULT_MONGODB_URL = 'mongodb://localhost/weblitmapper';
var MONGODB_URL = global.describe /* Are we running in a mocha test? */
                  ? 'mongodb://localhost/test'
                  : process.env.MONGODB_URL || DEFAULT_MONGODB_URL;

var db = module.exports = mongoose.createConnection(MONGODB_URL);
