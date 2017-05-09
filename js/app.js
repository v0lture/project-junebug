var config = {
    apiKey: "AIzaSyA5C1EVGQxGtelc4rrins837kIXA-Ib7Sg",
    authDomain: "project-junebug.firebaseapp.com",
    databaseURL: "https://project-junebug.firebaseio.com",
    projectId: "project-junebug",
    storageBucket: "project-junebug.appspot.com",
    messagingSenderId: "403725567370"
};
firebase.initializeApp(config);

// handle connection state
var stateRef = firebase.database().ref(".info/connected");
stateRef.on("value", function(snap) {
  if (snap.val() === true) {
    $(".statebox").slideUp();
    $("#state-header").text("Connected");
    $(".statebox > .ih-text").text("");
    Materialize.toast("You have gone online.", 5000);
  } else {
    $(".statebox").slideDown();
    $("#state-header").text("Disconnected");
    $(".statebox > .ih-text").text("Make sure you are connected to the internet. We will reconnect automatically.");
    Materialize.toast("You have gone offline.", 5000);
  }
});

var states = {
    1: "Open",
    2: "Closed",
    3: "Fixed",
    4: "Won't fix",
    5: "In progress",
    6: "Cannot reproduce"
};

var projects = {};
var issues = {};

var projectsRef = firebase.database().ref("/projects/");
projectsRef.on("child_added", function(snapshot) {
  console.log(snapshot.val());

  // handle submitting projects to wall
  $('.projectbox').append('<div id="proj-'+snapshot.key+'" onclick="filterIssues('+snapshot.key+')" class="waves-effect waves-light we"><p class="ih-text">'+snapshot.child('name').val()+'</p></div>');

  projects[snapshot.key] = snapshot.val();
});

var bugsRef = firebase.database().ref("/bugs/");
// read last 20 bugs
bugsRef.orderByKey().limitToLast(20).on("child_added", (snapshot) => {
    issues[snapshot.key] = snapshot.val();

    $(".centerbar").append('<div onclick="openIssue('+snapshot.key+')" class="issue"><p class="i-header">'+snapshot.child('title').val()+'</p><p class="i-desc truncate">'+snapshot.child('text').val()+'</p><div class="row"><div class="col s12 m6 l6"><p class="i-icon"><i class="material-icons left accent-text">announcement</i> '+states[snapshot.child('state').val()]+'</p><p class="i-icon"><i class="material-icons left accent-text">content_paste</i> '+projects[snapshot.child("project").val()].name+'</p></div><div class="col s12 m6 l6"><p class="i-icon truncate"><i class="material-icons left accent-text">account_box</i> <span id="issue-display-'+snapshot.key+'">loading</span></p><p class="i-icon"><i class="material-icons left accent-text">history</i> 23:24 - 5/8/17</p></div></div></div>');

    userFromUID(issues[snapshot.key].uid, snapshot.key);

});