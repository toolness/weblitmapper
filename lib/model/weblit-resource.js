var Schema = require('mongoose').Schema;

var db = require('../db');
var modelUtil = require('./util');

var likeSchema = new Schema({
  username: {type: String, required: true},
  emailHash: String
});

var schema = new Schema({
  title: String,
  url: {
    type: String,
    validate: modelUtil.safeURL,
    required: true,
    unique: true
  },
  description: String,
  username: String,
  emailHash: String,
  createdAt: {type: Date, default: Date.now},
  tags: [String],
  likes: [likeSchema]
});

var WeblitResource = db.model('WeblitResource', schema);

module.exports = WeblitResource;
