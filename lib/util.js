var urlParse = require('url').parse;

function parseEmail(email) {
  var parts = email.split('@');

  return {username: parts[0], domain: parts[1]};
}

exports.doesEmailMatch = function(email, emails) {
  email = email.toLowerCase();
  var emailDomain = parseEmail(email).domain;

  emails = emails.toLowerCase().split(',');
  for (var i = 0; i < emails.length; i++) {
    var currEmail = emails[i].trim();
    var currParts = parseEmail(currEmail);

    if (email == currEmail) return true;
    if (currParts.username == 'anyone' && emailDomain == currParts.domain)
      return true;
  }
  return false;
};

exports.squishName = function(name) {
  var letters = [];

  for (var i = 0; i < name.length; i++) {
    var letter = name[i].toLowerCase();
    if (letter.match(/[a-z1-9]/)) letters.push(letter);
  }

  return letters.join('');
};

exports.normalizeURL = function(url) {
  return /^https?:\/\//i.test(url) ? url : 'http://' + url;
};

exports.getDomain = function(url) {
  return urlParse(exports.normalizeURL(url)).hostname;
};
