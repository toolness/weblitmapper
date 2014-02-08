var _ = require('underscore');

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function FakeMakeAPI() {
  var self = this;
  var currSearchURL;

  this.url = function(url) {
    currSearchURL = url;
    return self;
  };

  this.then = function(cb) {
    process.nextTick(function() {
      if (currSearchURL in FakeMakeAPI.urls)
        return cb(null, [new FakeMake(currSearchURL)]);
      return cb(null, []);
    });
  };

  this.create = function(options, cb) {
    process.nextTick(function() {
      FakeMakeAPI.urls[options.url] = deepClone(options);
      cb(null, new FakeMake(options.url));
    });
  };
}

function FakeMake(url) {
  _.extend(this, deepClone(FakeMakeAPI.urls[url]));
}

FakeMake.prototype = {
  update: function(email, cb) {
    var snapshot = deepClone(this);
    process.nextTick(function() {
      _.extend(FakeMakeAPI.urls[snapshot.url], snapshot);
      cb(null);
    });
  }
};

FakeMakeAPI.urls = {};
FakeMakeAPI.reset = function() {
  Object.keys(this.urls).forEach(function(url) {
    delete this.urls[url];
  }, this);
};

module.exports = FakeMakeAPI;
