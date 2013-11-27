var url = require('url');

function HttpLoader(templateUrl, app, request) {
  if (app) app.use(this.middleware.bind(this));
  this.request = request || require('request');
  this.templateUrl = templateUrl;
  this.paths = {};
}

HttpLoader.prototype = {
  constructor: HttpLoader,
  async: true,
  getSource: function(name, cb) {
    var templateUrl = url.resolve(this.templateUrl, name);
    this.paths[name] = true;
    this.request(templateUrl, function(err, res, body) {
      if (err) return cb(err);
      if (res.statusCode >= 400 && res.statusCode < 500)
        return cb(null, null);
      if (res.statusCode == 200)
        return cb(null, {src: body});
      cb(new Error(templateUrl + ' returned status ' + res.statusCode));
    });
  },
  middleware: function(req, res, next) {
    if (req.query['reloadtemplates'] == '1')
      this.emptyCache();
    next();
  },
  emptyCache: function() {
    Object.keys(this.paths).forEach(function(path) {
      this.emit('update', path);
    }, this);
  },
  // Note that 'on' and 'emit' are supposed to be defined by nunjucks.Loader,
  // but that symbol is not properly exported in nunjucks 1.0.
  on: function(name, func) {
    this.listeners = this.listeners || {};
    this.listeners[name] = this.listeners[name] || [];
    this.listeners[name].push(func);
  },
  emit: function(name /*, arg1, arg2, ...*/) {
    var args = Array.prototype.slice.call(arguments, 1);

    if (this.listeners && this.listeners[name]) {
      this.listeners[name].forEach(function(listener) {
        listener.apply(null, args);
      });
    }
  }
};

module.exports = HttpLoader;
