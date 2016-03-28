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

var cardTemplate;
var modalTemplate;
var newCardTemplate;
var cardGenInfo;
var jsonInfo = {
  "Grants": [{
    "Grant_Name": "NSF Career",
    "Grant_Columns": [{
      "Column_Name": "To Do",
      "Cards": [{
        "Card_Name": "Cover Sheet",
        "Modal_ID": "Cover_Sheet",
        "Modal_Body": "<h3>Required</h3><ul><li><b>Program Solicitation Number</b></li><li><b>NSF Unit of Consideration</b></li><li><b>Project Title</b></li><li><b>Co-PIs</b></li><li><b>PI eligibility information</b></li></ul>",
        "Document_Link": "http://www.github.com"
      }, {
        "Card_Name": "Project Description",
        "Modal_ID": "Project_Description",
        "Modal_Body": "<h3>Required</h3><ul><li><b>Program Solicitation Number</b></li><li><b>NSF Unit of Consideration</b></li><li><b>Project Title</b></li><li><b>Co-PIs</b></li><li><b>PI eligibility information</b></li></ul>",
        "Document_Link": "http://www.github.com"
      }, {
        "Card_Name": "Budget",
        "Modal_ID": "Budget",
        "Modal_Body": "<h3>Required</h3><ul><li><b>Program Solicitation Number</b></li><li><b>NSF Unit of Consideration</b></li><li><b>Project Title</b></li><li><b>Co-PIs</b></li><li><b>PI eligibility information</b></li></ul>",
        "Document_Link": "http://www.github.com"
      }, {
        "Card_Name": "Budget Justification",
        "Modal_ID": "Budget_Justification",
        "Modal_Body": "<h3>Required</h3><ul><li><b>Program Solicitation Number</b></li><li><b>NSF Unit of Consideration</b></li><li><b>Project Title</b></li><li><b>Co-PIs</b></li><li><b>PI eligibility information</b></li></ul>",
        "Document_Link": "http://www.github.com"
      }]
    }, {
      "Column_Name": "In Progress",
      "Cards": [{
        "Card_Name": "References Cited",
        "Modal_ID": "References_Cited",
        "Modal_Body": "<h3>Required</h3><ul><li><b>Program Solicitation Number</b></li><li><b>NSF Unit of Consideration</b></li><li><b>Project Title</b></li><li><b>Co-PIs</b></li><li><b>PI eligibility information</b></li></ul>",
        "Document_Link": "http://www.github.com",
        "Assigned_People": ["Waffles", "Waffles"]
      }, {
        "Card_Name": "Biosketch",
        "Modal_ID": "Biosketch",
        "Modal_Body": "<h3>Required</h3><ul><li><b>Program Solicitation Number</b></li><li><b>NSF Unit of Consideration</b></li><li><b>Project Title</b></li><li><b>Co-PIs</b></li><li><b>PI eligibility information</b></li></ul>",
        "Document_Link": "http://www.github.com",
        "Assigned_People": ["Waffles"]
      }]
    }, {
      "Column_Name": "Complete",
      "Cards": [{
        "Card_Name": "Departmental Letter",
        "Modal_ID": "Departmental_Letter",
        "Modal_Body": "<h3>Required</h3><ul><li><b>Program Solicitation Number</b></li><li><b>NSF Unit of Consideration</b></li><li><b>Project Title</b></li><li><b>Co-PIs</b></li><li><b>PI eligibility information</b></li></ul>",
        "Document_Link": "http://www.github.com",
        "Assigned_People": ["Waffles"],
        "Tag_List": ["Under Review", "Complete"]
      }]
    }]
  }, {
    "Grant_Name": "NSF Career Copy",
    "Grant_Columns": [{
      "Column_Name": "To Do",
      "Cards": [{
        "Card_Name": "Cover Sheet",
        "Modal_ID": "Cover_Sheet",
        "Modal_Body": "<h3>Required</h3><ul><li><b>Program Solicitation Number</b></li><li><b>NSF Unit of Consideration</b></li><li><b>Project Title</b></li><li><b>Co-PIs</b></li><li><b>PI eligibility information</b></li></ul>",
        "Document_Link": "http://www.github.com"
      }, {
        "Card_Name": "Project Description",
        "Modal_ID": "Project_Description",
        "Modal_Body": "<h3>Required</h3><ul><li><b>Program Solicitation Number</b></li><li><b>NSF Unit of Consideration</b></li><li><b>Project Title</b></li><li><b>Co-PIs</b></li><li><b>PI eligibility information</b></li></ul>",
        "Document_Link": "http://www.github.com"
      }, {
        "Card_Name": "Budget",
        "Modal_ID": "Budget",
        "Modal_Body": "<h3>Required</h3><ul><li><b>Program Solicitation Number</b></li><li><b>NSF Unit of Consideration</b></li><li><b>Project Title</b></li><li><b>Co-PIs</b></li><li><b>PI eligibility information</b></li></ul>",
        "Document_Link": "http://www.github.com"
      }, {
        "Card_Name": "Budget Justification",
        "Modal_ID": "Budget_Justification",
        "Modal_Body": "<h3>Required</h3><ul><li><b>Program Solicitation Number</b></li><li><b>NSF Unit of Consideration</b></li><li><b>Project Title</b></li><li><b>Co-PIs</b></li><li><b>PI eligibility information</b></li></ul>",
        "Document_Link": "http://www.github.com"
      }]
    }, {
      "Column_Name": "In Progress",
      "Cards": [{
        "Card_Name": "References Cited",
        "Modal_ID": "References_Cited",
        "Modal_Body": "<h3>Required</h3><ul><li><b>Program Solicitation Number</b></li><li><b>NSF Unit of Consideration</b></li><li><b>Project Title</b></li><li><b>Co-PIs</b></li><li><b>PI eligibility information</b></li></ul>",
        "Document_Link": "http://www.github.com",
        "Assigned_People": ["Waffles", "Waffles"]
      }, {
        "Card_Name": "Biosketch",
        "Modal_ID": "Biosketch",
        "Modal_Body": "<h3>Required</h3><ul><li><b>Program Solicitation Number</b></li><li><b>NSF Unit of Consideration</b></li><li><b>Project Title</b></li><li><b>Co-PIs</b></li><li><b>PI eligibility information</b></li></ul>",
        "Document_Link": "http://www.github.com",
        "Assigned_People": ["Waffles"]
      }]
    }, {
      "Column_Name": "Complete",
      "Cards": [{
        "Card_Name": "Departmental Letter",
        "Modal_ID": "Departmental_Letter",
        "Modal_Body": "<h3>Required</h3><ul><li><b>Program Solicitation Number</b></li><li><b>NSF Unit of Consideration</b></li><li><b>Project Title</b></li><li><b>Co-PIs</b></li><li><b>PI eligibility information</b></li></ul>",
        "Document_Link": "http://www.github.com",
        "Assigned_People": ["Waffles"],
        "Tag_List": ["Under Review", "Complete"]
      }]
    }]
  }]
};

/*
$.getJSON( "json/cards.json", {}, function( data ) {
  jsonInfo = data.Grants[0];
});
*/

$.ajax({
  url: 'templates/detailBoard.html',
  dataType: 'html',
  method: 'GET',
  async: false,
  success: function(data) {
    cardTemplate = Handlebars.compile(data);
    $('#columnList').html(cardTemplate(jsonInfo.Grants[0]));
  }
});

$.ajax({
  url: 'templates/cardModal.html',
  dataType: 'html',
  method: 'GET',
  async: false,
  success: function(data) {
    modalTemplate = Handlebars.compile(data);
    $('#cardModals').html(modalTemplate(jsonInfo.Grants[0]));
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

    var test = JSON.stringify(testCard);

    $.ajax({
      url: 'http://localhost:3000/cards',
      type: 'PUT',
      data: test,
      contentType: 'application/json',
      sucess: function(result) {
        $('#cardModals').append(modalTemplate(modalLink));
      }
    });
  });
});

$('#cardGen').on('hidden.bs.modal', function () {
  $("#cardGenTitle").val("");
  $("#cardGenBody").val("Enter card body here.");
  $("#cardGenDocLink").val("");
})
