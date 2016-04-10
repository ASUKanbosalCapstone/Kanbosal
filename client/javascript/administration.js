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
}

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
    else
      jsonObj[formArray[i].name].push(formArray[i].value);

  callback(userId, jsonObj);
};

var template;

$(function () {
  $.ajax({
    url: '/templates/userManager.html',
    type: 'GET',
    dataType: 'html',
  }).done(function(data) {
      console.log('doing stuff');
    template = Handlebars.compile(data);
    $.getJSON('/getAdmin', function(json) {
      $('#contentview').append(template(json.pageData));
      loadNavbar(json.user);
    });
  });

  $.getJSON('/grants', function(json) {
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

    $('#confirmUserForm').submit(function (event) {
      event.preventDefault();
      confirmUser(userid);
      return false;
    });
  });

  $('#editUserModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget); // Button that triggered the modal
    var userid = button.data('userid'); // Extract info from data-* attributes

    $('#editUserForm').submit(function (event) {
      event.preventDefault();
      editUser(userid);
      return false;
    });
  });
});
