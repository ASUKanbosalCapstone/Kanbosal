var loadNavbar = function(user) {
  $.ajax({
    url : "/templates/navbar.html",
    dataType: "html",
    method: "GET",
    async: false,
    success: function(data) {
      template = Handlebars.compile(data);
      $("nav").append(template(user));
    }
  });
}
