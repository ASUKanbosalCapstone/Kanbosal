var auth2;

function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  var Storage = window.localStorage;

  $.getJSON('http://localhost:8080/login', {
    email: profile.getEmail()
  }, function(data) {
    // on success, check if user exists. yes: check if confirmed, then redirect; no: make new user
    if (data) {
      if (data.permissions.stage === -1) {
        alert("Sorry, " + data.name + ", you have not yet been confirmed and assigned. Please contact your person of referral to receive confirmation.");
        // signOut();  // uncomment after admin confirmation/assignment form is ready


        Storage.setItem('userData', JSON.stringify(data));  // temporary for access even without confirmation
        window.location.href = "overview";                  // temporary for access even without confirmation


      } else {
        // check if local storage is supported, else notify user to update or use a different browser.
        // if (storageAvailable('localStorage'))
        Storage.setItem('userData', JSON.stringify(data));
        window.location.href = "overview";
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
        url: 'http://localhost:8080/users',
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(newUser),
        success: function(data) {
          alert("Welcome. Your new account will be ready soon. Contact your person of referral if you have not yet been confirmed.");
          signOut();
        }
      });
    }
  });
}

function signOut() {
  auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    console.log('User signed out.');
    window.location.href = "/";
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
