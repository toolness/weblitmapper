$("body").on("click", ".js-edit-org-info", function() {
  var button = $(this);
  var formArea = button.next('.js-edit-org-info-form');

  button.fadeOut(function() { formArea.fadeIn(); });
});
