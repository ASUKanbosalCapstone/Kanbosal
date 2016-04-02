var progressBarTemplate;
var cardTemplate;
var modalTemplate;
var newCardTemplate;
var cardGenInfo;

var progressBar = {
  progress: 0
};

var totalCards = function(cards) {
  return cards.toDo.length + cards.inProgress.length + cards.complete.length;
}

var calculateProgress = function(cards) {
  progressBar.progress = (cards.complete.length + 0.5 * cards.inProgress.length) / totalCards(cards) * 100;
  return progressBar
}

$.ajax({
  url: '/getDetail',
  type: 'GET',
  dataType: 'json',
  async: false,
  success: function (cards) {
    // Updates the progress bar
    if (cards) {
      $.ajax({
        url: '/templates/progressBar.html',
        dataType: 'html',
        method: 'GET',
        async: false,
        success: function(data) {
          progressBarTemplate = Handlebars.compile(data);
          $('#progressBar').html(progressBarTemplate(calculateProgress(cards)));
        }
      });
      // Updates the whole board
      $.ajax({
        url: '/templates/detailBoard.html',
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
        url: '/templates/cardModal.html',
        dataType: 'html',
        method: 'GET',
        async: false,
        success: function(data) {
          modalTemplate = Handlebars.compile(data);
          $('#cardModals').html(modalTemplate(cards));
        }
      });
    }
  }
});

$.ajax({
  url : '/templates/newCard.html',
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
      url: '/cards',
      type: 'PUT',
      data: JSON.stringify(testCard),
      contentType: 'application/json',
      success: function(card) {
        // update grant here with result's _id parameter
        // might need to add progress bar updating here as well
        var updateParams = {$inc: {cardCount: 1}, $addToSet: {"stages.0.toDo": card._id}};

        $.ajax({
          url: '/updateGrant',
          type: 'POST',
          data: JSON.stringify(updateParams),
          contentType: 'application/json',
          success: function(results) {
            var test = results;
          }
        });

        $('#cardModals').append(modalTemplate(card));
      }
    });
  });

  // Updates the card whenever the modal is closed
  $(".currentCard").on("hidden.bs.modal", function () {
    var cardId = $(this).attr("id");
    var titleToUpdate = $(this).find(".card-title").val();
    var notesToUpdate = $(this).find(".card-notes").html();
    var urlToUpdate = $(this).find(".card-doc-link").val();
    var updateParams = {$set: {title: titleToUpdate, notes: notesToUpdate, documentUrl: urlToUpdate}};

    $.ajax({
      url: "/cards/" + cardId,
      type: "POST",
      data: JSON.stringify(updateParams),
      contentType: "application/json",
      success: function(results) {
        window.location.reload(true);
      },
      error: function(data) {
        var test = data;
      }
    });
  });
});

$('#cardGen').on('hidden.bs.modal', function () {
  $("#cardGenTitle").val("");
  $("#cardGenBody").val("Enter card body here.");
  $("#cardGenDocLink").val("");
})
