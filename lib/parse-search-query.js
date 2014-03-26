var _ = require('underscore');

var settings = require('./public-settings');
var weblitmap = require('./weblitmap');

var weblitCategories = _.values(weblitmap.tags);

function unnamespace(searchTerm) {
  if (searchTerm.indexOf(settings.WEBLIT_TAG_PREFIX) == 0)
    return searchTerm.slice(settings.WEBLIT_TAG_PREFIX.length);
  return searchTerm;
}

function getCategoryPropertyMatch(prop, searchTerm) {
  return _.find(weblitCategories, function(cat) {
    return cat[prop].toLowerCase().indexOf(searchTerm) != -1;
  });
}

module.exports = function parseSearchQuery(query) {
  var result = {tags: []};
  var hashtags = query.match(/#([A-Za-z0-9_\-]+)/g) || [];
  var user = query.match(/user:([A-Za-z0-9_\-]+)/);

  hashtags.forEach(function(hashtag) {
    var searchTerm = unnamespace(hashtag.slice(1).toLowerCase());
    var cat = getCategoryPropertyMatch('tag', searchTerm);

    if (!cat) cat = getCategoryPropertyMatch('name', searchTerm);
    if (cat) result.tags.push(cat.tag);
  });

  if (user) result.user = user[1];
  if (!result.tags.length) delete result.tags;

  return result;
};

module.exports.namespace = function namespace(query) {
  if (query.tags) {
    query.tags = query.tags.map(function(tag) {
      return settings.WEBLIT_TAG_PREFIX + tag;
    });
  } else {
    query.tagPrefix = settings.WEBLIT_TAG_PREFIX;
  }
  return query;
}
