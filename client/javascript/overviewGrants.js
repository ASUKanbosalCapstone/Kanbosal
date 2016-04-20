var template;
var user;
var grantid;

var loadDepartmentNavigation = function(overview) {
  if(overview.user.permissions.level == 1) {
    var stages = ["Research", "Internal", "ASU", "Complete"];

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
}

$(function() {
  $.ajax({
    url: 'getOverview',
    type: 'GET',
    dataType: 'json',
    success: function(overview) {
      user = overview.user;
      loadNavbar(user);

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

  $("#cardGenCreate").click(function () {
    var grantDescription = $("#grantDescription").summernote('code');
    var grantName = $("#grantName").val();
    var grantUrl = $("#grantUrl").val();

    var myGrant = {
      title : grantName,
      description : grantDescription,
      url : grantUrl,
      users : [],
      cardCount : 0,
      stages: [
        {
          progress: 0.0,
          toDo: [],
          inProgress: [],
          complete: []
        },
        {
          progress: 0.0,
          toDo: [],
          inProgress: [],
          complete: []
        },
        {
          progress: 0.0,
          toDo: [],
          inProgress: [],
          complete: []
        },
        {
          progress: 0.0,
          cards: []
        }
      ]
    };

    $.ajax({
      url: '/grants',
      type: 'PUT',
      data: JSON.stringify(myGrant),
      contentType: 'application/json',
      success: function(result) {
        var updateObj = {$addToSet: {grantIds: result._id}};

        $.ajax({
          url: '/users/' + user._id,
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(updateObj),
          success: function() {
            window.location.reload(true);
          }
        });
      }
    });
  })

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
