// input variable will eventually come from real input read from interface
// new cards should generally be added to the first column
    // (otherwise, find use case where user will add to different column?)

$(function() {
    var template;
    var input = {
        title: 'Test New Card',
        body: 'This is a new card that was added by clicking on the new card button.'
    };

    $.ajax({
        url : "templates/card.html",
        dataType: "html",
        method: "GET",
        success: function(data) {
            template = Handlebars.compile(data);
        }
    });
            
    $("#new-card").click(function(e) {
        e.preventDefault();
        $("#column-one").append(template(input));
    });
});