
var toggleElement = $('#menu-toggle');
var template;

$(function() {
  $.ajax({
    url: 'getOverview',
    type: 'GET',
    dataType: 'json',
    async: false,
    success: function(overview) {
      // console.log(overview);
      $.ajax({
        url: '/templates/sidebar.html',
        dataType: 'html',
        method: 'GET',
        async: false,
        success: function(data) {
          template = Handlebars.compile(data);
          $('#sidebar').html(template(overview));
        }
      });
    }
  })

})

$(function() {
    toggleElement.on('click', function(e) {
        e.preventDefault();
        $('#sidebar').toggleClass('toggled');
        $('#contentview').toggleClass('toggled');
        toggleElement.toggleClass('toggled');
    });
});
