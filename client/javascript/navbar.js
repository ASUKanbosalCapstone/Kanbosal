$(function() {
  var template;

  $.ajax({
    url: "/currentUser",
    type: "GET",
    dataType: "json",
    success: function(user) {
      $.ajax({
        url : "/templates/navbar.html",
        dataType: "html",
        method: "GET",
        success: function(data) {
          template = Handlebars.compile(data);
          $("nav").append(template(user));
        }
      });
    }
  });
});
