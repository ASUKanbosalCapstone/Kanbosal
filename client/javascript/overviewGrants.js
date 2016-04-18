var template;

var loadDepartmentNavigation = function(overview) {
  if(overview.user.permissions.level == 1) {
    var stages = ["Research", "Internal", "ASU", "Complete"];

    overview.departmentNames = stages;
    overview.currentDepartment = overview.user.permissions.stage;
  }
}

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
});
