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
                "Modal_Body": "<h3>Required</h3><li><b>Program Solicitation Number</b></li><li><b>NSF Unit of Consideration</b></li><li><b>Project Title</b></li><li><b>Co-PIs</b></li><li><b>PI eligibility information</b></li>",
                "Document_Link": "http://www.github.com",
                "Assigned_People" : []
              },
              {
                "Card_Name": "Project Description",
                "Modal_Body": "<h3>Required</h3>",
                "Document_Link": "http://www.github.com",
                "Assigned_People" : []
              }
            ]
          },

          {
            "Column_Name" : "In Progress",
            "Cards": [...]
          },

          {
            "Column_Name" : "Complete",
            "Cards": [...]
          }
        ]
      }
    ]
  }

  Current Status:
    * Dynamic column generation
    * Dynamic card generation
    * Display people, iff they are on a card.
    * Sick documentation @see above
  TODO:
    * Support Comments
    * Support Tags (e.g under review)

  @author: Morgan Nesbitt
*/

var template;
var grantName = "NSF Career";
var jsonInfo;

$.getJSON( "json/cards.json", {}, function( data ) {
  jsonInfo = data.Grants[0];
});

$.ajax({
    url: 'templates/full_card.html',
    dataType: 'html',
    method: 'GET',
    async: false,
    success: function(data) {
        template = Handlebars.compile(data);
        $('#columnList').html(template(jsonInfo));
    }
});
