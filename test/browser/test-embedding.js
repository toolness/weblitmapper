(function() {
  module("embedding");

  asyncTest("embedding public view works", function() {
    var script = document.createElement('script');

    script.setAttribute('src', '/js/embed.js');
    script.onembeddingloaded = function(container) {
      ok(container.innerHTML.length, "HTML is set in container");
      equal(script.parentNode, null, "script is removed from page");
      equal(container.parentNode, document.body, "container is in body");
      document.body.removeChild(container);
      start();
    };
    document.body.appendChild(script);
  });
})();
