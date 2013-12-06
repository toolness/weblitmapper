(function() {
  var script = document.scripts[document.scripts.length - 1];
  var container = document.createElement('div');
  var link = document.createElement('a');
  var origin, req;

  link.href = script.src;
  origin = link.protocol + '//' + link.host;

  req = new XMLHttpRequest();

  req.open('GET', origin + '/embedded');
  req.send(null);
  req.onreadystatechange = function() {
    if (req.readyState == 4 && (req.status == 200 || req.status == 0)) {
      container.innerHTML = req.responseText;
      script.parentNode.replaceChild(container, script);
      if (typeof(script.onembeddingloaded) == 'function')
        script.onembeddingloaded(container);
    }
  };
})();
