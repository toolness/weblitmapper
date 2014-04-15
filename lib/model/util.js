var safeURL = [function(str) {
  if (!str) return true;
  return /^https?:\/\//.test(str);
}, "Valid URLs must be http or https."];

exports.safeURL = safeURL;
