/*global firebase:true projects:true states:true severity:true issues:true userDialog Materialize pagination moment:true */
/*eslint no-undef: "error"*/

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
    $(".statebox").slideUp();
  if (snap.val() !== true) {
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

var severity = {
    1: "Request",
    2: "Minor",
    3: "Low",
    4: "Normal",
    5: "Major",
    6: "Critical"
};

var startAt;

var projects = {};

var projectsRef = firebase.database().ref("/projects/");
projectsRef.on("child_added", function(snapshot) {
  // handle submitting projects to wall
  $(".projectbox").append("<div id=\"proj-"+snapshot.key+"\" onclick=\"filterIssues("+snapshot.key+")\" class=\"waves-effect waves-light we\"><p class=\"ih-text\">"+snapshot.child("name").val()+"</p></div>");
  $("#new-issue-projects").append("<p><input class=\"with-gap\" value=\""+snapshot.key+"\" name=\"new-issue-project\" type=\"radio\" id=\"new-issue-project-"+snapshot.key+"\" /><label for=\"new-issue-project-"+snapshot.key+"\">"+snapshot.child("name").val()+"</label></p>");

  projects[snapshot.key] = snapshot.val();
});

var bugsRef = firebase.database().ref("/bugs/");

// delete any deleted bugs
bugsRef.orderByKey().on("child_removed", (snapshot) => {
    issues[snapshot.key] = null;
    
    $("#issue-"+snapshot.key).remove();
});