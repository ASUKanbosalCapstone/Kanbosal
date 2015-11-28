
var toggleElement = $('#menu-toggle');
var template;
var input = {
    grants: [
        {name: 'John Doe\'s Grant'},
        {name: 'Lowell\'s Grant'},
        {name: 'Another Grant'},
        {name: 'And Another Grant'},
        {name: 'And Another Grant'},
        {name: 'And Another Grant'},
        {name: 'And Another Grant'},
        {name: 'And Another Grant'},
        {name: 'And Another Grant'}]
};

$.ajax({
    url: 'templates/sidebar.html',
    dataType: 'html',
    method: 'GET',
    async: false,
    success: function(data) {
        template = Handlebars.compile(data);
        $('#sidebar').html(template(input));
    }
});

$(function() {
    toggleElement.on('click', function(e) {
        e.preventDefault();
        $('#sidebar').toggleClass('toggled');
        $('#contentview').toggleClass('toggled');
        toggleElement.toggleClass('toggled');
    });
});
