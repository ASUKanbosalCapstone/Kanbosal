$(function () {
  var template;
  var templatePend =
    '<div class="col-xs-4 col-md-3" style="white-space:nowrap;">\
        <img class="img-responsive img-rounded pull-left" style="display:inline-block; margin-right:4px;" src="{{ imageUrl }}">\
        <a class="btn btn-primary"><i class="fa fa-fw fa-envelope"></i></a>\
        <a class="btn btn-primary"><i class="fa fa-fw fa-times"></i></a>\
        <a class="btn btn-primary"><i class="fa fa-fw fa-check"></i></a>\
        <div>{{ name }}</div>\
    </div>';
  var templateDept =
    '<div class="list-group-item">\
      <h5>{{ name }}, <small>{{ title }}</small></h5>\
      <img class="img-responsive img-rounded" style="max-width:45px; display:inline-block;" src="{{ imageUrl }}">\
      <a class="btn btn-primary btn-lg" href="mailto:{{ email }}" title="Send {{ name }} an email."><i class="fa fa-fw fa-envelope"></i></a>\
      <a class="btn btn-primary btn-lg" href="#"><i class="fa fa-fw fa-pencil"></i></a>\
    </div>';

  $.getJSON('/manageUsers', { 'permissions.stage': -1 }, function (users) {
    template = Handlebars.compile(templatePend);
    if (users.length !== 0)
      for (i in users)
        $('#pendingUsers > .panel-body > .row').append(template(users[i]));
    else
      $('#pendingUsers * .alertEmpty').show('fast');
  });

  $.getJSON('/manageUsers', { 'permissions.stage': 0 }, function (users) {
    template = Handlebars.compile(templateDept);
    if (users.length !== 0)
      for (i in users)
        $('#researchUsers > .list-group').append(template(users[i]));
    else
      $('#researchUsers > .panel-body').show('fast');
  });

  $.getJSON('/manageUsers', { 'permissions.stage': 1 }, function (users) {
    template = Handlebars.compile(templateDept);
    if (users.length !== 0)
      for (i in users)
        $('#internalUsers > .list-group').append(template(users[i]));
    else
      $('#internalUsers > .panel-body').show('fast');
  });

  $.getJSON('/manageUsers', { 'permissions.stage': 2 }, function (users) {
    template = Handlebars.compile(templateDept);
    if (users.length !== 0)
      for (i in users)
        $('#asuUsers > .list-group').append(template(users[i]));
    else
      $('#asuUsers > .panel-body').show('fast');
  });

  // $.getJSON('/manageUsers', { 'permissions.stage': -2 }, function (users) {
  //   template = Handlebars.compile(templatePend);
  //   if (users.length !== 0)
  //     for (i in users)
  //       $('#inactiveUsers > .panel-body').append(template(users[i]));
  //   else
  //     $('#inactiveUsers * .alertEmpty').show('fast');
  // });
});