/*
  Overview: Provided a grant name, will access the respective json file represnting that grant
    and retrieve the necessary info. There are helper variables in this class to assist in
    parsing the json file.

  The current structure of the JSON is to be as follows:
  {
    "Grants": [
      {
        "Grant_Name" : "NSF Career",
        "Grant_Columns" : [
          {
            "Column_Name" : "To Do",
            "Cards": [
              {
                "Card_Name": "Cover Sheet",
                "Modal_ID" : "Cover_Sheet",
                "Modal_Body": "<h3>Required</h3><ul><li><b>Program Solicitation Number</b></li><li><b>NSF Unit of Consideration</b></li><li><b>Project Title</b></li><li><b>Co-PIs</b></li><li><b>PI eligibility information</b></li></ul>",
                "Document_Link": "http://www.github.com"
              }
            ]
          },

          {
            "Column_Name" : "In Progress",
            "Cards": [
              {
                "Card_Name": "References Cited",
                "Modal_ID" : "References_Cited",
                "Modal_Body": "",
                "Document_Link": "http://www.github.com",
                "Assigned_People" : ["Waffles", "Waffles"]
              }
            ]
          },

          {
            "Column_Name" : "Complete",
            "Cards": [
              {
                "Card_Name": "Departmental Letter",
                "Modal_ID" : "Departmental_Letter",
                "Modal_Body": "",
                "Document_Link": "http://www.github.com",
                "Tag_List" : ["Under Review", "Complete"]
              }
            ]
          }
        ]
      }
    ]
  }

  NOTE:
    * Tag_List and Assigned_People are optional
    * Rest of the fields are required

  Current Status:
    * Dynamic column generation
    * Dynamic card generation
    * Displays body contents on In Progress or Complete column (People, Links, Tags)
    * Supported Tags for Complete column are, Under Review and Complete
    * Sick documentation @see above
  TODO:
    * Support Comments
    * Support additional tags

  @author: Morgan Nesbitt
*/

var totalCards = function(cards) {
  return cards.toDo.length + cards.inProgress.length + cards.complete.length;
}

var calculateProgress = function(cards) {
  progressBar.progress = (cards.complete.length + 0.5 * cards.inProgress.length) / totalCards(cards) * 100;
  return progressBar
}

var cardTemplate;
var modalTemplate;
var newCardTemplate;
var cardGenInfo;
var cardList;

var progressBar = {
  progress: 0
};

// Will contain the list of gathered cards from the database
var testCards = {
  "progress":80,
  "toDo": [{
    "_id":"56f330b1fc88b4120a05a3e6",
    "title":"TestCard1",
    "notes":"<h3>Required</h3><ul><li><b>Program Solicitation Number</b></li><li><b>NSF Unit of Consideration</b></li><li><b>Project Title</b></li><li><b>Co-PIs</b></li><li><b>PI eligibility information</b></li></ul>",
    "documentUrl":"testurl",
    "status":"to_do",
    "tags":[],
    "userIds":[],
    "lock":[false,false,false,false],
    "timeCreated":"2016-03-24T00:11:29.590Z",
    "timeLastEdit":"2016-03-24T00:11:29.590Z"
  }, {
    "_id":"56f330f3fc88b4120a05a3e7",
    "title":"TestCard2",
    "notes":[],
    "documentUrl":"testurl",
    "status":"to_do",
    "tags":[],
    "userIds":[],
    "lock":[false,false,false,false],
    "timeCreated":"2016-03-24T00:12:35.775Z",
    "timeLastEdit":"2016-03-24T00:12:35.775Z"
  }],
  "inProgress": [{
    "_id":"56f9c4b5dbbb88cd45208b75",
    "title":"TestCard3",
    "notes":[],
    "documentUrl":"testurl",
    "status":"to_do",
    "tags":[],
    "userIds":[],
    "lock":[false,false,false,false],
    "timeCreated":"2016-03-28T23:56:37.594Z",
    "timeLastEdit":"2016-03-28T23:56:37.594Z"
  }],
  "complete": [{
    "_id":"56f9c4f1dbbb88cd45208b76",
    "title":"TestCard4",
    "notes":[],
    "documentUrl":"testurl",
    "status":"to_do",
    "tags":[],
    "userIds":[],
    "lock":[false,false,false,false],
    "timeCreated":"2016-03-28T23:57:37.411Z",
    "timeLastEdit":"2016-03-28T23:57:37.411Z"
  }]
};

$.ajax({
  url: 'http://localhost:8080/getDetail',
  type: 'GET',
  dataType: 'html',
  success: function (cards) {
    // Updates the progress bar
    $.ajax({
      url: 'templates/progressBar.html',
      dataType: 'html',
      method: 'GET',
      async: false,
      success: function(data) {
        cardTemplate = Handlebars.compile(data);
        $('#progressBar').html(cardTemplate(calculateProgress(cards)));
      }
    });
    // Updates the whole board
    $.ajax({
      url: 'templates/detailBoard.html',
      dataType: 'html',
      method: 'GET',
      async: false,
      success: function(data) {
        cardTemplate = Handlebars.compile(data);
        $('#columnList').html(cardTemplate(cards));
      }
    });
    // Updates the individual card modals
    $.ajax({
      url: 'templates/cardModal.html',
      dataType: 'html',
      method: 'GET',
      async: false,
      success: function(data) {
        modalTemplate = Handlebars.compile(data);
        $('#cardModals').html(modalTemplate(cards));
      }
    });
  },
  error: function (data) {
    var test = data;
  }
});


$.ajax({
  url : 'templates/newCard.html',
  dataType: 'html',
  method: 'GET',
  success: function(data) {
    newCardTemplate = Handlebars.compile(data);
  }
});

$(function() {
  $('[data-toggle="tooltip"]').tooltip();
  $( "#cardGenCreate" ).click(function() {
    var title = $("#cardGenTitle").val();
    var body = $("#cardGenBody").html();
    var documentLink = $("#cardGenDocLink").val();
    var modalID = title.replace(" ", "-");
    cardGenInfo = {
      Card_Name: title,
      Modal_ID: modalID
    };
    var modalLink = {
      Grant_Columns : [
        {
          Cards: [
            {
              Card_Name: title,
              Modal_ID: modalID,
              Modal_Body: body,
              Document_Link: documentLink
            }
          ]
        }
      ]
    };
    $("#columnList > div:first-child * .column").append(newCardTemplate(cardGenInfo));

    var testCard = {
      title: title,
      notes: body,
      documentUrl: documentLink,
      status: "to_do",
      tags: [],
      userIds: [],  // add current user id here
      lock: [false, false, false, false]
    }

    $.ajax({
      url: 'http://localhost:8080/cards',
      type: 'PUT',
      data: JSON.stringify(testCard),
      contentType: 'application/json',
      success: function(results) {
        // update grant here with result's _id parameter
        // might need to add progress bar updating here as well
        var updateParams = {$inc: {cardCount: 1}, $addToSet: {"stages.0.toDo": results._id}} // Can update the specified index with the given user Permission index

        $.ajax({
          url: 'http://localhost:8080/grants/' + '56f482f70fbb7aee0e113d10',  // replace with passed grantid
          type: 'POST',
          data: updateParams,
          contentType: 'application/json',
          success: function(results) {
            var test = results;
          }
        });

        $('#cardModals').append(modalTemplate(result));
      }
    });
  });
});

$('#cardGen').on('hidden.bs.modal', function () {
  $("#cardGenTitle").val("");
  $("#cardGenBody").val("Enter card body here.");
  $("#cardGenDocLink").val("");
})
