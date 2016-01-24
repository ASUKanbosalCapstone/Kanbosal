function onSignIn(googleUser)
{
  var profile = googleUser.getBasicProfile();
  console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
  console.log('Name: ' + profile.getName());
  console.log('Image URL: ' + profile.getImageUrl());
  console.log('Email: ' + profile.getEmail());

  window.location.href = "overview"
}

function signOut()
{
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    console.log('User signed out.');
  });
  window.location.href = "/Kanbosal"
}

function onLoad() {
  gapi.load('auth2', function() {
    gapi.auth2.init();
  });
}
