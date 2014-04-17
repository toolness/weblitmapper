window.openWindowAndWaitForSignal = function(url, cb) {
  var w = window.open(url, null, 'width=640,height=480');

  window.addEventListener('message', function onMessage(e) {
    if (e.source === w && e.data == 'success') {
      window.removeEventListener('message', onMessage, false);
      cb();
    }
  }, false);
};

window.reloadPage = function() {
  // We bind this to a global so we can stub it out in test suites, as
  // location.reload can't be stubbed.
  location.reload();
};

(function() {
  var session = require('./lib/browser/session');

  $("body").on("click", ".js-login", function() {
    openWindowAndWaitForSignal('/wmconnect/login', reloadPage);
    return false;
  });
  $("body").on("click", ".js-logout", function() {
    $.post("/wmconnect/logout", {
      _csrf: session.csrfToken
    }, reloadPage);
    return false;
  });
})();
