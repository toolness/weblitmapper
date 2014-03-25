// Modified from http://ejohn.org/blog/javascript-pretty-date/.

var MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

function normalDate(date) {
  return 'on ' + date.getUTCDate() + ' ' + MONTHS[date.getUTCMonth()] +
         ' ' + date.getUTCFullYear();
}

// Takes a date and returns a string representing how
// long ago the date represents.
module.exports = function prettyDate(date) {
  var diff = ((new Date()).getTime() - date.getTime()) / 1000;
  var day_diff = Math.floor(diff / 86400);

  if (isNaN(day_diff) || day_diff < 0 || day_diff >= 31)
    return normalDate(date);

  return day_diff == 0 && (
      diff < 60 && "just now" ||
      diff < 120 && "1 minute ago" ||
      diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
      diff < 7200 && "1 hour ago" ||
      diff < 86400 && Math.floor( diff / 3600 ) + " hours ago") ||
    day_diff == 1 && "Yesterday" ||
    day_diff < 7 && day_diff + " days ago" ||
    day_diff < 31 && Math.ceil( day_diff / 7 ) + " weeks ago" ||
    normalDate(date);
}
