var template;
var user = {
  "name" : "string",        //google email -- use as ref when user logs in?
  "email" : "string",
  "hashKey" : "string",       //from google auth, stored hash
  "imageUrl" : "string",
  "title" : "string",
  "description" : "string",
  "permissions" : {
    "level" : "int",        //normal (0), PI (1), etc
    "department" : "string"     //Research, Internal, ASU, etc
  }//,
  // "grantIds" : [input.grant[0], input.grant[1], input.grant[2]]   //grants they have access to
};
var card = {
  "title" : "string",
  "notes" : ["string"],       //array of strings using boots
  "documentUrl" : "string",        //url to document
  "timeCreated" : "datetime",
  "timeLastEdit" : "datetime",
  "tags" : ["string"],        //might be unnecessary
  "userIds" : ["string"]      //users who have contributed
};
var input = {
  "grant" : [{
    "title" : "NSF Career",
    "description" : "Example description of this grant proposal.",
    "url" : "http://www.nsf.gov/awardsearch/showAward?AWD_ID=1323753&HistoricalAwards=false",
    "users" : [user, user, user, user],
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
    "users" : [user, user, user, user],
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
      "toDo" : [],                      //this = internal.complete[]
      "inProgress" : [],
      "complete" : [card, card, card]
    }, {
      "progress" : 0,
      "cards" : [card, card, card]                      //this = asu.complete[]
    }]
  }, {
    "title" : "NSF Air Force Copy",
    "description" : "This is also a description of the grant proposal.",
    "url" : null,
    "users" : [user, user, user, user],
    "cardCount" : 10,
    "stage" : [{
      "progress" : 28.5714286,
      "toDo" : [],
      "inProgress" : [],
      "complete" : [card, card, card, card, card, card, card, card, card, card]
    }, {
      "progress" : 0,
      "toDo" : [card],                  //this = research.complete[]
      "inProgress" : [card, card, card, card, card, card],
      "complete" : [card, card, card]
    }, {
      "progress" : 0,
      "toDo" : [card],                      //this = internal.complete[]
      "inProgress" : [],
      "complete" : [card, card]
    }, {
      "progress" : 0,
      "cards" : [card, card]                      //this = asu.complete[]
    }]
  }]
};

$(function () {
  $.ajax({
    url : 'templates/overviewPanel.html',
    dataType: 'html',
    method: 'GET',
    success: function(data) {
      template = Handlebars.compile(data);
      $("#overviewContent").append(template(input));
      $('[data-toggle="tooltip"]').tooltip({container:'body'});
    }
  });

  $('#grant-descr-editor').markdown({
    iconlibrary: 'fa',
    hiddenButtons: ['cmdPreview'],
    fullscreen: {
      enable: false
    },
    footer: '<small><div id="grant-descr-editor-ftr" style="display:none;"></div></small>',
    onChange: function(e) {
      var content = e.parseContent();
      var content_length = (content.match(/\n/g)||[]).length + content.length;
      if (content == '') $('#grant-descr-editor-ftr').hide();
      else $('#grant-descr-editor-ftr').show().html(content);
    }
  });

  $('#grantGen * [data-toggle="popover"]').popover({
    container:'body',
    html : true
  });
});
