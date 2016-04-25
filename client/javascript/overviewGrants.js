var template;
var user;
var grantid;

var loadDepartmentNavigation = function(overview) {
  if(overview.user.permissions.level == 1) {
    var stages = ['Research', 'Internal', 'ASU', 'Complete'];

    overview.departmentNames = stages;
    overview.currentDepartment = overview.user.permissions.stage;
  }
};

var loadDepartment = function(grantID, stageIndex) {
  var query = '/setAdminStage?stage=' + stageIndex;
  $.ajax({
    url: query,
    type: 'POST',
    contentType: 'application/json',
    success: function() {
      window.location = '/detail/' + grantID;
    }
  });
};

var editGrant = function (grantid) {
  jsonObj = {
    title: $('#grantNameEdit').val(),
    description: $('#grantDescriptionEdit').summernote('code'),
    url: $('#grantUrlEdit').val()
  };

  // check to make sure entered documentLink has http/https appended to the front
  var regex = new RegExp("(http|https|ftp)://");

  if (!regex.test(jsonObj.url.toLowerCase())) {
    jsonObj.url = "http://" + jsonObj.url.toLowerCase();
  }

  $.ajax({
    url: '/grants/' + grantid,
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({
      $set: jsonObj
    }),
  }).done(function() {
    window.location.reload(true);
  });
};

var insertGrant = function (myGrant) {
  $.ajax({
    url: '/grants',
    type: 'PUT',
    data: JSON.stringify(myGrant),
    contentType: 'application/json',
    success: function(result) {
      var updateObj = {$addToSet: {grantIds: result.insertedIds[0]}};

      $.ajax({
        url: '/users/' + user._id,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(updateObj),
        success: function() {
          // window.location.reload(true);
          window.location = '/detail/' + result.insertedIds[0];
        }
      });
    }
  });
};

var createGrant = function (myGrant, cardTemplates) {
  if (cardTemplates)
    $.ajax({
      url: '/cards',
      type: 'PUT',
      data: JSON.stringify(cardTemplates),
      contentType: 'application/json',
    }).done(function(result) {
      myGrant.cardCount = result.insertedCount;
      myGrant.stages[0].toDo = result.insertedIds;
    }).then(function () {
      insertGrant(myGrant);
    });
  else insertGrant(myGrant);
};

$(function() {
  $.ajax({
    url: 'getOverview',
    type: 'GET',
    dataType: 'json',
    success: function(overview) {
      user = overview.user;
      loadNavbar(user);

      // Remove delete privileges for non admins
      if (user.permissions.level !== 1) {
        $('#grantEditDelete').remove();
      }

      loadDepartmentNavigation(overview);

      $.ajax({
        url : 'templates/overviewPanel.html',
        dataType: 'html',
        method: 'GET',
        success: function(data) {
          template = Handlebars.compile(data);
          $("#overviewContent").append(template(overview));
          $('[data-toggle="tooltip"]').tooltip({container:'body'});
        }
      });
    }
  });

  $('#grantGen * [data-toggle="popover"]').popover({
    container:'body',
    html : true
  });

  $('#grantEdit').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget); // Button that triggered the modal
    grantid = button.data('grantid'); // Extract info from data-* attributes
    var modal = $(this);

    $.ajax({
      url: '/grants/' + grantid,
      type: 'GET',
      dataType: 'json'
    }).done(function(data) {
      $('#grantNameEdit').val(data.title);
      $('#grantUrlEdit').val(data.url);
      $('#grantDescriptionEdit').summernote('code', data.description);
      $('#grantEditSubmit').click(function () {
        editGrant(grantid);
      });
      // $('#grantEditDismiss').click(function () {
      //   $('#grantEditSubmit').unbind();
      // })
    });
  });

  $('#cardGenCreate').click(function () {
    var grantDescription = $('#grantDescription').summernote('code');
    var grantName = $('#grantName').val();
    var grantUrl = $('#grantUrl').val().toLowerCase();
    var grantTemplate = parseInt($('#grantTemplate').val(), 10);
    var templates = [
      [{"title":"Cover Sheet","documentUrl":"","tags":[],"userIds":[],"lock":[false,false,false,false]},{"title":"Project Description","documentUrl":"","tags":[],"userIds":[],"lock":[false,false,false,false]},{"title":"References Cited","documentUrl":"","tags":[],"userIds":[],"lock":[false,false,false,false]},{"title":"Biosketch","documentUrl":"","tags":[],"userIds":[],"lock":[false,false,false,false]},{"title":"Departmental Letter","documentUrl":"","tags":[],"userIds":[],"lock":[false,false,false,false]},{"title":"Letters of Collaboration (optional)","documentUrl":"","tags":[],"userIds":[],"lock":[false,false,false,false]},{"title":"Budget","documentUrl":"","tags":[],"userIds":[],"lock":[false,false,false,false]},{"title":"Budget Justification","documentUrl":"","tags":[],"userIds":[],"lock":[false,false,false,false]}]
      //add more temaplate here is needed
    ];

    // check to make sure entered documentLink has http/https appended to the front
    var regex = new RegExp("(http|https|ftp)://");

    if (!regex.test(grantUrl.toLowerCase())) {
      grantUrl = "http://" + grantUrl.toLowerCase();
    }

    var myGrant = {
      title: grantName,
      description: grantDescription,
      url: grantUrl,
      users: [],
      cardCount: 0,
      stages: [{
        toDo: [],
        inProgress: [],
        complete: []
      }, {
        toDo: [],
        inProgress: [],
        complete: []
      }, {
        toDo: [],
        inProgress: [],
        complete: []
      }, {
        cards: []
      }]
    };

    var cardTemplate = {
      cardCount: 0,
      cardIds: []
    };

    switch (grantTemplate) {
      case 0:
        createGrant(myGrant);
        break;
      case 1:
        // for (card in templates[0])
        //   insertTemplateCards(templates[0][card], function(cardId) {
        //     cardTemplate.cardCount += 1;
        //     cardTemplate.cardIds.push(cardId);
        //   });
        createGrant(myGrant, templates[0]);
        break;
      // add more cases here if needed
      default:
        break;
    }
    
    // console.log(myGrant);
    // createGrant(myGrant, cardTemplate);
  });

  $('#modalDelete').on('hidden.bs.modal', function() {
    $('#grantEdit').modal('hide');
  });

  $('#confirmDeleteButton').click(function() {
    $.ajax({
      url: '/grants/' + grantid,
      type: 'DELETE',
      contentType: 'application/json',
      success: function() {
        window.location.reload(true);
      }
    });
  });
});
