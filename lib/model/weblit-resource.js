var Schema = require('mongoose').Schema;

var db = require('../db');
var modelUtil = require('./util');

var schema = new Schema({
  title: String,
  url: {type: String, validate: modelUtil.safeURL},
  description: String,
  username: String,
  createdAt: {type: Date, default: Date.now},
  tags: [String],
  likes: [String]
});

var WeblitResource = db.model('WeblitResource', schema);

module.exports = WeblitResource;
