function bookmarklet() {
  var url = encodeURIComponent(window.location.href);
  var title = encodeURIComponent(document.title);
  window.open('{{ORIGIN}}/update?url=' + url + '&title=' + title,
              null, 'resizable,scrollbars,status,width=800,height=480');
}

module.exports = function(origin) {
  var js = bookmarklet.toString().replace('{{ORIGIN}}', origin);
  return 'javascript:(' + encodeURI(js) + ')()';
}

if (!module.parent)
  console.log(module.exports(process.argv[2]));
