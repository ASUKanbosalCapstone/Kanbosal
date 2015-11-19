var source;
var data = { grants: [
    {name:"John Doe's Grant"},
    {name:"Lowell's Grant"}
]};

$.ajax({
    url : "templates/sidebar.html",
    dataType: "html",
    method: "GET",
    async: false,
    success: function(data) {
        source = data;
    }
});
var template = Handlebars.compile(source);
$("#sidebar").html(template(data));

$("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#mainview").toggleClass("toggled");
    $("#toggleIcon").toggleClass("toggled");
});
