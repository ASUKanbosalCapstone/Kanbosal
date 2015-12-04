var template;
var input = {
    Card_Name: 'NewCard',
    Modal_ID: 'NewCard'
};

$.ajax({
    url : 'templates/newCard.html',
    dataType: 'html',
    method: 'GET',
    success: function(data) {
        template = Handlebars.compile(data);
    }
});

$(function() {
    $('#new-card').on('click', function(e) {
        e.preventDefault();
        $('#columnList > div:first-child').append(template(input));
    });
});
