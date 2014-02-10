$('body').on("click", "[data-slide-toggle]", function() {
  var id = $(this).attr('data-slide-toggle');
  $(document.getElementById(id)).slideToggle();
});
