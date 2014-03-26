window.addEventListener('error', function(e) {
  console.log('ERROR', e.message, e.filename, e.lineno);
}, false);
