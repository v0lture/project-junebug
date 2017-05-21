/*global firebase:true states:true severity:true issues:true userDialog Materialize */
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
}

var page = 1;
var keyi = 1;

var startAt;

var projects = {};
var issues = {};
var issuekeys = {};

var projectsRef = firebase.database().ref("/projects/");
projectsRef.on("child_added", function(snapshot) {
  // handle submitting projects to wall
  $(".projectbox").append("<div id=\"proj-"+snapshot.key+"\" onclick=\"filterIssues("+snapshot.key+")\" class=\"waves-effect waves-light we\"><p class=\"ih-text\">"+snapshot.child("name").val()+"</p></div>");
  $("#new-issue-projects").append("<p><input class=\"with-gap\" value=\""+snapshot.key+"\" name=\"new-issue-project\" type=\"radio\" id=\"new-issue-project-"+snapshot.key+"\" /><label for=\"new-issue-project-"+snapshot.key+"\">"+snapshot.child("name").val()+"</label></p>");

  projects[snapshot.key] = snapshot.val();
});

// get last key for previous page
function getKeyFor(page){
    if(issuekeys.length <= (page-1)*20) {
        return issuekeys[issuekeys.length-1];
    } else {
        return issuekeys[(page-1)*20];
    }
}

var bugsRef = firebase.database().ref("/bugs/");

// delete any deleted bugs
bugsRef.orderByKey().on("child_removed", (snapshot) => {
    issues[snapshot.key] = null;
    
    $("#issue-"+snapshot.key).remove();
});

// read last 20 bugs
function getIssues(paginate = true){
    $(".issues-array").html("");

    keyi = ((page-1) * 20)+1;

    if(paginate){
        startAt = getKeyFor(page);
        console.log(getKeyFor(page));
    } else {
        startAt = "";
    }

    bugsRef.orderByKey().limitToFirst(20).startAt(startAt).on("child_added", (snapshot) => {
        issues[snapshot.key] = snapshot.val();

        issuekeys[keyi] = snapshot.key;
        keyi++;

        $(".issues-array").append("<div id=\"issue-"+snapshot.key+"\" onclick='openIssue(this)' class=\"issue\"><p class=\"i-header\">"+snapshot.child("title").val()+"</p><p class=\"i-desc truncate\">"+snapshot.child("text").val()+"</p><div class=\"row\"><div class=\"col s12 m6 l6\"><p class=\"i-icon\"><i class=\"material-icons left accent-text\">announcement</i> "+states[snapshot.child("state").val()]+"</p><p class=\"i-icon\"><i class=\"material-icons left accent-text\">content_paste</i> "+projects[snapshot.child("project").val()].name+"</p></div><div class=\"col s12 m6 l6\"><p class=\"i-icon truncate\"><i class=\"material-icons left accent-text\">account_box</i> "+snapshot.child("display").val()+"</p><p class=\"i-icon\"><i class=\"material-icons left accent-text\">history</i> "+moment(snapshot.child("time").val()).fromNow()+"</p></div></div></div>");

    });
}

// 

// pagination UI
function pagination(loc){

    if(loc === "+") {
        // add page
        page++;
        $("#pagination-minus").show();
        $("#pagination-minus-t").show();
    } else if(loc === "-") {
        if(page < 2){
            page = 1;
        } else {
            page--;
        }
    }

    // safety overwrite conflict
    if(getKeyFor(page) === undefined && page !== 1){
        page--;
        $("#pagination-plus").hide();
        $("#pagination-plus-t").hide();
    }

    if(getKeyFor(page + 1) === undefined){
        $("#pagination-plus").hide();
        $("#pagination-plus-t").hide();
    }

    $("#pagination-pg").html("<a>"+page+"</a>");
    $("#pagination-pg-t").html("<a>"+page+"</a>");
    if(page === 1){
        $("#pagination-minus").hide();
        $("#pagination-minus-t").hide();
        $("#pagination-plus").show();
        $("#pagination-plus-t").show();
        getIssues(false);
    } else {
        getIssues();
    }
    
}