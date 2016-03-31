$(function() {
  var template;
  var input = {};

  $.ajax({
    url : "/templates/footer.html",
    dataType: "html",
    method: "GET",
    success: function(data) {
      template = Handlebars.compile(data);
      $("footer").append(template(input));
    }
  });
});
