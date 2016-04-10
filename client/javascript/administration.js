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
  initConfirmUser(function (jsonObj) {
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
  });
};

var initConfirmUser = function (callback) {
  var jsonObj = { grantIds:[] };
  var formArray = $('#confirmUserForm').serializeArray();

  for (i in formArray)
    if (i < 2)
      jsonObj[formArray[i].name] = parseInt(formArray[i].value, 10);
    else
      jsonObj[formArray[i].name].push(formArray[i].value);

  callback(jsonObj);
};

var template;

$(function () {

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
