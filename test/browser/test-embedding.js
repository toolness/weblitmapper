(function() {
  module("embedding");

  asyncTest("embedding public view works", function() {
    var div = document.createElement('div');
    var script = document.createElement('script');

    script.setAttribute('src', '/embed.js');
    script.onload = script.onreadystatechange = function() {
      var container = div.firstChild;
      ok(container.innerHTML.length, "HTML is set in container");
      equal(script.parentNode, null, "script is removed from page");
      equal(container.parentNode, div, "container is in div");
      document.body.removeChild(div);
      start();
    };
    document.body.appendChild(div);
    div.appendChild(script);
  });
})();
