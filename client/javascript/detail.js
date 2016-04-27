var progressBarTemplate;
var cardTemplate;
var modalTemplate;
var newCardTemplate;
var cardGenInfo;
var currentCard = {};
var parser = new DOMParser();

var progressBar = {
  progress: 0
};

var totalCards = function(cards) {
  return cards.toDo.length + cards.inProgress.length + cards.complete.length;
}

var calculateProgress = function(cards) {
  progressBar.progress = (cards.complete.length + 0.5 * cards.inProgress.length) / totalCards(cards) * 100;

  if (isNaN(progressBar.progress))
    progressBar.progress = 0;

  progressBar.progress = Math.round(progressBar.progress * 100) / 100

  return progressBar;
}

/* Sets up the cards returned upon page load */
var setupCards = function(user, cards) {
  convertDates(cards.toDo);
  convertDates(cards.inProgress);
  convertDates(cards.complete);

  populateUsers(cards.toDo);
  populateUsers(cards.inProgress);
  populateUsers(cards.complete);

  updateLocks(user, cards.toDo);
  updateLocks(user, cards.inProgress);
  updateLocks(user, cards.complete);
}

/* Converts card's timeLastEdit to equivalent local time */
var convertDates = function(cards) {
  for (var i = 0; i < cards.length; i++) {
    var date = new Date(cards[i].timeLastEdit);
    cards[i].timeLastEdit = date.toLocaleString();
  }
}

/* Populates the cards with user images and names */
var populateUsers = function(cards) {
  for(var i = 0; i < cards.length; i++) {
    for(var j = 0; j < cards[i].userIds.length; j++) {
      $.ajax({
        url: '/users/' + cards[i].userIds[j],
        type: 'GET',
        dataType: 'json',
        async: false,
        success: function(user) {
          cards[i].userIds[j] = user;
        }
      });
    }
  }
}

/* Updates the card's lock attribute for just the current displayed stage */
var updateLocks = function(user, cards) {
  for (var i = 0; i < cards.length; i++) {
    // card has been approved all stages
    if (cards[i].lock[2] == true)
      cards[i].done = true;
    // card has been approved for current stage
    else if (cards[i].lock[user.permissions.stage] == true)
      cards[i].stageDone = true;
  }
}

/* Checks to see if any changes have occured in the card displayed in the modal */
var isCardChanged = function(card) {
  if (card.title != currentCard.title)
    return true;
  if (card.notes != currentCard.notes)
    return true;
  if (card.documentUrl != currentCard.documentUrl)
    return true;
  return false;
}

var modifyCardMovement = function(user, cards) {
  if(user.permissions.level == 1) {
    if(user.permissions.stage > 0)
      for(var i = 0; i < cards.toDo.length; i++)
        cards.toDo[i].moveBack = "holder";
    if(user.permissions.stage < 3)
      for(var i = 0; i < cards.complete.length; i++)
        cards.complete[i].moveForward = "holder";
  }
};

var moveCardColumn = function(cardID, isMovingForward) {
  var isCallable = true;
  var query = '/moveCardStage/';

  if (isMovingForward == 'true') query += cardID;
  else if (isMovingForward == 'false') query += cardID + '?back=true';
  else isCallable = false;

  if (isCallable) {
    $.ajax({
      url: query,
      type: 'POST',
      contentType: 'application/json',
      success: function() {
        window.location.reload(true);
      }
    });
  }
};

$.ajax({
  url: '/getDetail',
  type: 'GET',
  dataType: 'json',
  async: false,
  success: function (detailView) {
    var user = detailView.user;
    var cards = detailView.cards;
    cards.currentStage = user.permissions.stage;

    setupCards(user, cards);
    loadNavbar(user);

    modifyCardMovement(user, cards);

    var departmentName = getCurrentDepartmentName(user);

    var detailGrant = '<h4>' + departmentName + '</h4>';
    var detailDepartment = '<p>' + detailView.cards.grantTitle + '</p>';

    $('#detail-grant').html(detailGrant);
    $('#detail-department').html(detailDepartment);


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
          $('#columnList > div').html(cardTemplate(cards));

          // $("#preventPropagation").bind('click', function() {
          //   event.stopPropagation();
          // });
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
      }).then(function () {
        for (var i in cards.complete) {
          if (cards.complete[i].done || cards.complete[i].stageDone) {
            $('#' + cards.complete[i]._id + ' * .editable').summernote('disable');
          }
        }
      });
    }
  }
}).then(function () {
  $('[data-toggle="popover"]').popover({
    container:'body',
    html : true
  });
}).then(function () {
  // Removes tag from the card object and view
  var removeTag = function(tag, callback) {
    var updateParams = {$pull: {tags: tag.value}};

    $.ajax({
      url: '/cards/' + tag.cardId,
      type: 'POST',
      data: JSON.stringify(updateParams),
      contentType: 'application/json',
      success: function() {
        callback();
      }
    });
  }

  // apply click for remove a tag after popover init
  $('.remove-tag').click(function() {
    var tag = {
      this: $(this).parent('.card-tag'),
      value: $(this).data('tagvalue'),
      cardId: $(this).data('cardid')
    };
    removeTag(tag, function() {
      tag.this.remove();
    });
  });

  // Removes tags from popover
  $('body').on('click', '.remove-tag', function() {
    var tag = {
      this: $(this).parent('.card-tag'),
      value: $(this).data('tagvalue'),
      cardId: $(this).data('cardid')
    };
    removeTag(tag, function() {
      window.location.reload(true);
    });
  });
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
    var documentLink = $("#cardGenDocLink").val().toLowerCase();
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
    $("#columnList > div > div:first-child * .sortable").append(newCardTemplate(cardGenInfo));

    // check to make sure entered documentLink has http/https appended to the front
    var regex = new RegExp("(http|https|ftp)://");

    if (!regex.test(documentLink)) {
      documentLink = "http://" + documentLink;
    }

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
        var updateParams = {$inc: {cardCount: card.insertedCount}, $addToSet: {"stages.0.toDo": card.insertedIds[0]}};

        $.ajax({
          url: '/updateGrant',
          type: 'POST',
          data: JSON.stringify(updateParams),
          contentType: 'application/json',
          success: function() {
            window.location.reload(true);
          }
        });
      }
    });
  });

  // Stores card info to check for changes against
  $('.currentCard').on('shown.bs.modal', function() {
    currentCard.id = $(this).attr('id');
    currentCard.title = $(this).find('.card-title').val();
    currentCard.notes = $(this).find('.card-notes').summernote('code');
    currentCard.documentUrl = $(this).find('.card-doc-link').val();
    currentCard.tag = $(this).find('.card-tag-new');

    // Adds a new tag to the grant
    $('.add-tag').click(function() {
      var cardId = currentCard.id;
      var newTag = currentCard.tag.val();

      var updateParams = {$addToSet: {tags: newTag}};

      if (newTag != "" && newTag.length < 30) {
        $.ajax({
          url: '/cards/' + cardId,
          type: 'POST',
          data: JSON.stringify(updateParams),
          contentType: 'application/json',
          success: function() {
            window.location.reload(true);
          }
        });
      } else {
        $('.add-tag').tooltip('show');

        setTimeout(function () {
          $('.add-tag').tooltip('hide');
        }, 5000);
      }
    });
  });

  $('body').on('click', function (e) {
    $('[data-toggle=popover]').each(function () {
      // hide any open popovers when the anywhere else in the body is clicked
      if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
        $(this).popover('hide');
      }
    });
  });

  // Updates the card whenever the modal is closed
  $('.currentCard').on('hidden.bs.modal', function () {
    var card = {
      id: $(this).attr('id'),
      title: $(this).find('.card-title').val(),
      notes: $(this).find('.card-notes').summernote('code'),
      documentUrl: $(this).find('.card-doc-link').val()
    };

    if (isCardChanged(card)) {
      // check to make sure entered documentLink has http/https appended to the front
      var regex = new RegExp("(http|https|ftp)://");

      if (!regex.test(card.documentUrl.toLowerCase())) {
        card.documentUrl = "http://" + card.documentUrl.toLowerCase();
      }

      var updateParams = {$set: {title: card.title, notes: card.notes, documentUrl: card.documentUrl}};

      $.ajax({
        url: '/cards/' + card.id,
        type: 'POST',
        data: JSON.stringify(updateParams),
        contentType: 'application/json',
        success: function() {
          window.location.reload(true);
        }
      });
    }
  });

  // Removes both modals if modalDelete gets hidden
  $("#modalDelete").on("hidden.bs.modal", function() {
    $(".currentCard").modal("hide");
  });

  // Deletes the current card after delete confirmation
  $("#confirmDeleteButton").click(function() {
    var cardId = currentCard.id;

    $.ajax({
      url: "/cards/" + cardId,
      type: "DELETE",
      contentType: "application/json",
      success: function() {
        window.location.reload(true);
      },
      error: function(data) {
        var test = data;
      }
    });
  });

  // Sends the given card back for changes
  $("#confirmSendBackButton").click(function() {
    var cardId = $(".currentCard").attr("id");
    moveCardColumn(cardId, 'false');
  });
});

$('#cardGen').on('hidden.bs.modal', function() {
  $("#cardGenTitle").val("");
  $("#cardGenDocLink").val("");
})

$( ".sortable" ).sortable({
  //When a column receives a sortable
  receive : function (event, ui)
  {
    var cardID, senderColumn, receivingColumn;

    //Extract Card ID
    var innerHTML = ui.item.context.innerHTML;
    var xmlDOC = parser.parseFromString(innerHTML, "text/xml");
    cardID = xmlDOC.getElementById("detail-card").getAttribute("data-target").substring(1);

    //Get column name for receiving column.
    receivingColumn = event.target.parentElement.children[0].innerText;

    //Get name of column it moved from
    senderColumn = ui.sender.context.parentElement.children[0].innerText;

    //TODO insert in correct position
    moveCard(cardID, senderColumn, receivingColumn, -1);
  }
});

function moveCard(cardID, senderColumn, receivingColumn)
{
  var databaseSenderColumnName = displayToDatabaseColumnName(senderColumn);
  var databaseReceivingColumnName = displayToDatabaseColumnName(receivingColumn);

  $.ajax({
    url: 'moveCard/'+ cardID +'?curCol='+ databaseSenderColumnName +'&newCol='+ databaseReceivingColumnName,
    type: 'POST',
    contentType: 'application/json',
    success: function() {
      window.location.reload(true);
    }
  });

  //Diagnostics
  // console.log("CARD ID: " + cardID)
  // console.log("Moved from column: " + databaseSenderColumnName);
  // console.log("To column: " + databaseReceivingColumnName)
}

function displayToDatabaseColumnName(columnName)
{
  switch(columnName)
  {
    case "To Do":
      return "toDo";
    case "In Progress":
      return "inProgress";
    case "Complete":
      return "complete";
  }
}

function getCurrentDepartmentName(user)
{
  switch(parseInt(user.permissions.stage))
  {
    case 0:
      return "Research";
    case 1:
      return "Internal";
    case 2:
      return "ASU";
    case 3:
      return "Complete";
  }
}
