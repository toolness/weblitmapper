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
