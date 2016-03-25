var auth2;

function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();

  console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
  console.log('Name: ' + profile.getName());
  console.log('Image URL: ' + profile.getImageUrl());
  console.log('Email: ' + profile.getEmail());

  window.location.href = "overview";
}

function signOut() {
  auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    console.log('User signed out.');
    window.location.href = "/"
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
