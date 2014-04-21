var fs = require('fs');
var path = require('path');
var _ = require('underscore');

var db = require('../db');

exports.all = function() {
  fs.readdirSync(__dirname).filter(function(filename) {
    return path.extname(filename) == '.js'
  }).map(function(filename) {
    return './' + filename;
  }).forEach(require);
  return _.values(db.models);
};
