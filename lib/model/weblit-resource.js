var crypto = require('crypto');
var Schema = require('mongoose').Schema;

var db = require('../db');
var modelUtil = require('./util');

var likeSchema = new Schema({
  username: {type: String, required: true},
  email: String,
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
  email: String,
  emailHash: String,
  createdAt: {type: Date, default: Date.now},
  tags: [String],
  likes: [likeSchema]
});

function md5(str) {
  var md5sum = crypto.createHash('md5');
  md5sum.update(str);
  return md5sum.digest('hex')
}

function hashEmail(email) {
  return md5(email.toLowerCase().trim());
}

function setEmailHash(cb) {
  if (this.email)
    this.emailHash = hashEmail(this.email);
  cb();
}

likeSchema.pre('save', setEmailHash);
schema.pre('save', setEmailHash);

var WeblitResource = db.model('WeblitResource', schema);

module.exports = WeblitResource;
