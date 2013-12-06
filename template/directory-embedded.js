(function() {
  var script = document.scripts[document.scripts.length - 1];
  var container = document.createElement('div');

  container.innerHTML = {{ htmlString }};
  script.parentNode.replaceChild(container, script);
})();
