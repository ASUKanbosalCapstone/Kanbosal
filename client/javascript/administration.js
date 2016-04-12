var updateUser = function (userId, jsonObj) {
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

var denyUser = function (userId) { updateUser(userId, { 'permissions.stage': -2 }); };
var confirmUser = function (userId) { initConfirmUser(userId, updateUser); };
var editUser = function (userId) { initEditUser(userId, updateUser); };

var initConfirmUser = function (userId, callback) {
  var jsonObj = { grantIds:[] };
  var formArray = $('#confirmUserForm').serializeArray();

  for (i in formArray)
    if (i < 2)
      jsonObj[formArray[i].name] = parseInt(formArray[i].value, 10);
    else
      jsonObj[formArray[i].name].push(formArray[i].value);

  callback(userId, jsonObj);
};

var initEditUser = function (userId, callback) {
  var jsonObj = { grantIds:[] };
  var formArray = $('#editUserForm').serializeArray();

  for (i in formArray)
    if (i < 2)
      jsonObj[formArray[i].name] = parseInt(formArray[i].value, 10);
    else if (i > 2)
      jsonObj[formArray[i].name].push(formArray[i].value);

  callback(userId, jsonObj);
};

var selectAllGrants = function (action) {
  $('#selectedGrants' + action + ' option').attr('selected', 'selected');
  console.log('it tried');
};

var addGrant = function (action) {
  var toAdd = $('#selectGrants' + action).serializeArray();
  var grantIndex = function (id) {
    for (i in grants)
      if (grants[i]._id === id)
        return i;
  };
  
  if ($('#selectedGrants' + action).find('option[value="' + toAdd[0].value + '"]').length === 0)
    $('<option/>', {
      value: grants[grantIndex(toAdd[0].value)]._id,
      text: grants[grantIndex(toAdd[0].value)].title
    }).appendTo('#selectedGrants' + action);

  $('#selectGrants' + action).val('');
};

var removeGrant = function (action) {
  var toRemove = $('#selectedGrants' + action).serializeArray();

  for (i in toRemove)
    $('#selectedGrants' + action + ' option[value="' + toRemove[i].value + '"]').remove();

  // fix for bug (when testing in chrome) removing grants will not detect remaining options
  $('#selectedGrants' + action).html($('#selectedGrants' + action).html());
};

var cancel = function (modalId) {
  $(modalId).unbind();
}

var template;
var grants;

$(function () {
  $('[data-toggle="popover"]').popover({
    html: true
  });

  $.ajax({
    url: '/templates/userManager.html',
    type: 'GET',
    dataType: 'html',
  }).done(function(data) {
    template = Handlebars.compile(data);
    $.getJSON('/getAdmin', function(json) {
      $('#contentview').append(template(json.pageData));
      loadNavbar(json.user);
    });
  });

  $.getJSON('/grants', function(json) {
    grants = json;
    for (i in json)
      $('<option/>', {
        value: json[i]._id,
        text: json[i].title
      }).appendTo('#selectGrantsConfirm, #selectGrantsEdit');
  });

  $('#denyUserModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget); // Button that triggered the modal
    var userid = button.data('userid'); // Extract info from data-* attributes
    var modal = $(this);

    modal.find('button.btn-gold').attr('onclick', 'denyUser(\'' + userid + '\')');
  });

  $('#deactivateUserModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget); // Button that triggered the modal
    var userid = button.data('userid'); // Extract info from data-* attributes
    var modal = $(this);

    modal.find('button.btn-gold').attr('onclick', 'denyUser(\'' + userid + '\')');
  });

  $('#confirmUserModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget); // Button that triggered the modal
    var userid = button.data('userid'); // Extract info from data-* attributes
    var modal = $(this);

    $.ajax({
      url: '/users/' + userid,
      type: 'GET',
      dataType: 'json'
    }).done(function(data) {
      modal.find('#confirmModalName').html(data.name);
    });

    $('#confirmUserForm').submit(function (event) {
      event.preventDefault();
      confirmUser(userid);
      return false;
    });
  });

  // update modal with user
  $('#editUserModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget); // Button that triggered the modal
    var userid = button.data('userid'); // Extract info from data-* attributes
    var modal = $(this);
    var populateGrants = "";

    $.ajax({
      url: '/users/' + userid,
      type: 'GET',
      dataType: 'json'
    }).done(function(data) {
      modal.find('#editModalName').html(data.name);
      modal.find('#stageInputEdit').val(data.permissions.stage);
      modal.find('#levelInputEdit').val(data.permissions.level);
      modal.find('#editDeactivateBtn').attr('data-userid', userid);
      modal.find('#selectedGrantsEdit').empty();
    }).then(function (data) {
      for (i in grants)
        if ($.inArray(grants[i]._id, data.grantIds) !== -1)
          $('<option/>', {
            value: grants[i]._id,
            text: grants[i].title
          }).appendTo('#selectedGrantsEdit');
    });

    $('#editUserForm').submit(function (event) {
      event.preventDefault();
      editUser(userid);
      return false;
    });
  });
});
