var config = {
    apiKey: "AIzaSyA5C1EVGQxGtelc4rrins837kIXA-Ib7Sg",
    authDomain: "project-junebug.firebaseapp.com",
    databaseURL: "https://project-junebug.firebaseio.com",
    projectId: "project-junebug",
    storageBucket: "project-junebug.appspot.com",
    messagingSenderId: "403725567370"
};
firebase.initializeApp(config);

var projectsRef = firebase.database().ref("/projects/");
projectsRef.on("child_added", function(snapshot) {
  console.log(snapshot.val());

  // handle submitting projects to wall
  $('.projectbox').append('<div class="waves-effect waves-light we"><p class="ih-text">'+snapshot.child('name').val()+'</p></div>');
});