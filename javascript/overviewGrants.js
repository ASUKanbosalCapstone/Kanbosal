var template;
var card = {
  "title" : "string",
  "notes" : ["string"],       //array of strings using boots
  "documentUrl" : "string",        //url to document
  "timeCreated" : "datetime",
  "timeLastEdit" : "datetime",
  "status" : "string",        //to_do, in_progress, complete
  "tags" : ["string"],        //might be unnecessary
  "userIds" : ["string"]      //users who have contributed
}
var input = {
  "grant" : [{
    "title" : "NSF Career",
    "description" : "Example description of this grant proposal.",
    "url" : "http://www.nsf.gov/awardsearch/showAward?AWD_ID=1323753&HistoricalAwards=false",
    "users" : ["string", "string", "string", "string"],
    "cardCount" : 7,
    "stage" : [{
      "progress" : "28.5714286",
      "toDo" : [card, card, card, card],
      "inProgress" : [card, card],
      "complete" : [card]
    }, {
      "progress" : 0,
      "toDo" : [card],                  //this = research.complete[]
      "inProgress" : [],
      "complete" : []
    }, {
      "progress" : 0,
      "toDo" : [],                      //this = internal.complete[]
      "inProgress" : [],
      "complete" : []
    }, {
      "progress" : 0,
      "cards" : []                      //this = asu.complete[]
    }]
  }, {
    "title" : "NSF Air Force",
    "description" : "This is also a description of the grant proposal.",
    "url" : "http://www.nsf.gov/awardsearch/showAward?AWD_ID=1313312&HistoricalAwards=false",
    "users" : ["string", "string", "string", "string"],
    "cardCount" : 10,
    "stage" : [{
      "progress" : 28.5714286,
      "toDo" : [card, card],
      "inProgress" : [card, card],
      "complete" : [card, card, card, card, card, card]
    }, {
      "progress" : 0,
      "toDo" : [card],                  //this = research.complete[]
      "inProgress" : [card, card],
      "complete" : [card, card, card]
    }, {
      "progress" : 0,
      "toDo" : [card, card],                      //this = internal.complete[]
      "inProgress" : [],
      "complete" : [card]
    }, {
      "progress" : 0,
      "cards" : [card]                      //this = asu.complete[]
    }]
  }]
};

$.ajax({
  url : 'templates/overviewPanel.html',
  dataType: 'html',
  method: 'GET',
  success: function(data) {
    template = Handlebars.compile(data);
    // before using input, we can manipulate the object to display to the template.
    $("#overviewContent").append(template(input));
  }
});

$(function() {
  $('[data-toggle="tooltip"]').tooltip();
});
