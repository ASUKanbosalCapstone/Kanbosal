var denyUser = function (userId) {
  $.ajax({
    url: '/users/' + userId,
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({
      $set: { 'permissions.stage': -2 }
    }),
    success: function() {
      window.location.reload(true);
    },
    error: function () {
      alert('There was a problem processing your request. Please try again later.');
    }
  });
};

var confirmUser = function (userId) {
  var jsonObj = { grantIds:[] };
  var formArray = $('#confirmUserForm').serializeArray();

  for (i in formArray)
    if (i < 2)
      jsonObj[formArray[i].name] = parseInt(formArray[i].value, 10);
    else
      jsonObj[formArray[i].name].push(formArray[i].value);

  $.ajax({
    url: '/users/' + userId,
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({
      $set: jsonObj
    }),
    async: false,
    success: function() {
      window.location.reload(true);
    },
    error: function () {
      alert('There was a problem processing your request. Please try again later.');
    }
  });
};

var template;
var templatePend =
  '<div class="col-xs-4 col-md-3" style="white-space:nowrap;">\
    <div class="well well-sm">\
      <img class="img-responsive img-rounded pull-left" style="display:inline-block; margin-right:4px;" src="{{ imageUrl }}">\
      <a class="btn btn-primary" data-toggle="tooltip" data-placement="top" title="Contact by email." href="mailto:{{ email }}"><i class="fa fa-fw fa-envelope"></i></a>\
      <span data-toggle="tooltip" data-placement="top" title="Deny user."><button class="btn btn-primary" data-toggle="modal" data-target="#denyUserModal" title="Deny user access." data-userid="{{ _id }}"><i class="fa fa-fw fa-times"></i></button></span>\
      <span data-toggle="tooltip" data-placement="top" title="Confirm identity."><button class="btn btn-primary" data-toggle="modal" data-target="#confirmUserModal" title="Confirm identity." data-userid="{{ _id }}"><i class="fa fa-fw fa-check"></i></button></span>\
      <br><strong><small>{{ name }}</small></strong>\
    </div>\
  </div>';
var templateDept =
  '<div class="list-group-item">\
    <h5>{{ name }} <small>{{ title }}</small></h5>\
    <img class="img-responsive img-rounded" style="max-width:45px; display:inline-block;" src="{{ imageUrl }}">\
    <a class="btn btn-primary btn-lg" href="mailto:{{ email }}" title="Send {{ name }} an email."><i class="fa fa-fw fa-envelope"></i></a>\
    <a class="btn btn-primary btn-lg" href="#"><i class="fa fa-fw fa-pencil"></i></a>\
  </div>';

$(function () {
  $.getJSON('/manageUsers', { 'permissions.stage': -1 }, function (users) {
    template = Handlebars.compile(templatePend);
    if (users.length !== 0) {
      $('#pendingUsersRow').show('fast');
      for (i in users)
        $('#pendingUsers > .panel-body > .row').append(template(users[i]));
    }
  });

  $.getJSON('/manageUsers', { 'permissions.stage': 0 }, function (users) {
    template = Handlebars.compile(templateDept);
    if (users.length !== 0)
      for (i in users)
        $('#researchUsers > .list-group').append(template(users[i]));
    else
      $('#researchUsers > .panel-body').show('fast');
  }).then(function () {
    $('[data-toggle="tooltip"]').tooltip();
    $('[data-toggle="popover"]').popover({
      container:'body',
      html : true
    });
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

  $.getJSON('/manageUsers', { 'permissions.stage': -2 }, function (users) {
    template = Handlebars.compile(templatePend);  // temporarily use pending template
    if (users.length !== 0)
      for (i in users)
        $('#inactiveUsers > .panel-body > .row').append(template(users[i]));
    else
      $('#inactiveUsers * .alertEmpty').show('fast');
  });

  $.getJSON('/grants', function(json, textStatus) {
    for (i in json)
      $('select#select-grants').append('<option value="' + json[i]._id + '">' + json[i].title + '</option>');
  });

  $('#denyUserModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget); // Button that triggered the modal
    var userid = button.data('userid'); // Extract info from data-* attributes
    var modal = $(this);

    modal.find('button.btn-gold').attr('onclick', 'denyUser(\'' + userid + '\')');
  });

  $('#confirmUserModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget); // Button that triggered the modal
    var userid = button.data('userid'); // Extract info from data-* attributes
    var modal = $(this);
    var form = modal.find('form#confirmUserForm').serializeArray();

    $('#confirmUserForm').submit(function (event) {
      event.preventDefault();
      confirmUser(userid);
      return false;
    });
  });
});
