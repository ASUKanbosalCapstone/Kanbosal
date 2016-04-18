var template;

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
      loadNavbar(overview.user);

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
    var grantid = button.data('grantid'); // Extract info from data-* attributes
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
      $('#grantEditDismiss').click(function () {
        $('#grantEditSubmit').unbind();
      })
    });
  });
});
