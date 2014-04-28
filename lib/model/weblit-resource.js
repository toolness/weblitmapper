var crypto = require('crypto');
var _ = require('underscore');
var Schema = require('mongoose').Schema;

var db = require('../db');
var parseSearchQuery = require('../parse-search-query');
var modelUtil = require('./util');

var likeSchema = new Schema({
  username: {type: String, required: true},
  email: String,
  emailHash: String
}, {autoIndex: false});

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
  likes: [likeSchema],
  allText: String
}, {autoIndex: false});

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
schema.pre('save', function setAllText(next) {
  this.allText = this.title + '\n' + this.url + '\n' + this.description;
  next();
});

schema.methods.toPublicJSON = function() {
  var plainSelf = this.toObject();
  var obj = _.pick(plainSelf, 'title', 'url', 'description', 'username',
                   'emailHash', 'tags');
  obj.id = plainSelf._id.toString();
  obj.createdAt = plainSelf.createdAt.toISOString();
  obj.likes = plainSelf.likes.map(function(like) {
    return _.pick(like, 'username', 'emailHash');
  });
  return obj;
};

schema.methods.isLikedByUser = function(username) {
  return this.likes.some(function(like) {
    return like.username == username;
  });
};

schema.methods.like = function(username, email, emailHash) {
  if (!this.isLikedByUser(username))
    this.likes.push({
      username: username,
      email: email,
      emailHash: emailHash
    });
};

schema.methods.unlike = function(username) {
  for (var i = 0; i < this.likes.length; i++) {
    if (this.likes[i].username == username)
      return this.likes.pull(this.likes[i]);
  }
};

schema.statics.findFromStringQuery = function(query, options, cb) {
  if (typeof(options) == 'function') {
    cb = options;
    options = undefined;
  }
  options = options || {};

  var page = options.page;
  var pageSize = options.pageSize;
  var query = this.find(parseSearchQuery(query, {mongo: true}));

  if (page && pageSize)
    query = query.limit(pageSize).skip((page-1) * pageSize);

  return cb ? query.exec(cb) : query;
};

var WeblitResource = db.model('WeblitResource', schema);

module.exports = WeblitResource;
