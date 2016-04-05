var auth2;

function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  var Storage = window.localStorage;

  $.getJSON('/login', {
    email: profile.getEmail()
  }, function(data) {
    console.log('before: ' + data);
    // on success, check if user exists. yes: check if confirmed, then redirect; no: make new user
    if (data) {
      if (data.permissions.stage === -1) {
        gapi.auth2.getAuthInstance().signOut();          // temporarily commented until confirmation is available
        $('#alertDeactivated').hide();
        $('#alertRegistered').hide();
        $('#alertProblem').hide();
        $('#alertUnconfirmed').show('fast');

        // window.location.href = "overview";                  // temporary for access even without confirmation

      } else if (data.permissions.stage === -2) {
        gapi.auth2.getAuthInstance().signOut();
        $('#alertUnconfirmed').hide();
        $('#alertRegistered').hide();
        $('#alertProblem').hide();
        $('#alertDeactivated').show('fast');
      } else {  // update user image data in db, then go to overview
        $.ajax({
          url: '/users/' + data._id,
          type: 'POST',
          contentType: "application/json",
          data: JSON.stringify({
            $set: { 'imageUrl': profile.getImageUrl() }
          }),
          success: function () {
            window.location.href = "overview";
          },
          error: function () {
            alert('There was a problem processing your request. Please try again later.');
          }
        });
      }
    } else {
      var newUser = {
        "name" : profile.getName(),
        "email" : profile.getEmail(),
        "imageUrl" : profile.getImageUrl(),
        "title" : "",
        "permissions" : {
          "level" : -1,
          "stage" : -1
        },
        "grantIds" : []
      };

      $.ajax({
        url: 'users',
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(newUser),
        success: function(data) {
          gapi.auth2.getAuthInstance().signOut();
          $('#alertDeactivated').hide();
          $('#alertUnconfirmed').hide();
          $('#alertProblem').hide();
          $('#alertRegistered').show('fast');
        }
      });
    }
  }).error(function() {
    gapi.auth2.getAuthInstance().signOut();
    $('#alertDeactivated').hide();
    $('#alertUnconfirmed').hide();
    $('#alertRegistered').hide();
    $('#alertProblem').show('fast');
  });
}

function signOut() {
  auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    $.get('logout', function() {
      console.log('User signed out.');
      window.location.href = "/";
    });
  });
}

function onLoad() {
  gapi.load('auth2', function() {
    auth2 = gapi.auth2.init();

    auth2.then(function () {
      if (!auth2.isSignedIn.get()) {
        window.location.href = "/";
        console.log("Requested access to page when not logged in");
      }
    });
  });
}
