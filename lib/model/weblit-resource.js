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

schema.methods.isLikedByUser = function(username) {
  return this.likes.some(function(like) {
    return like.username == username;
  });
};

schema.methods.like = function(username, email) {
  if (!this.isLikedByUser(username))
    this.likes.push({
      username: username,
      email: email
    });
};

schema.methods.unlike = function(username) {
  for (var i = 0; i < this.likes.length; i++) {
    if (this.likes[i].username == username)
      return this.likes.pull(this.likes[i]);
  }
};

schema.statics.findTagged = function(cb) {
  return this.find({tags: {$not: {$size: 0}}}, cb);
};

var WeblitResource = db.model('WeblitResource', schema);

module.exports = WeblitResource;
