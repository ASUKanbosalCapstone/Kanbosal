$(function() {
  var template;
  var input = {};

  $.ajax({
    url : "/templates/navbar.html",
    dataType: "html",
    method: "GET",
    success: function(data) {
      template = Handlebars.compile(data);
      $("nav").append(template(input));
    }
  });
});
