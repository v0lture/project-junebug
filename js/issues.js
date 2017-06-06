/*global firebase:true projects:true states:true severity:true issues:true userDialog Materialize pagination moment:true */
/*eslint no-undef: "error"*/

var issueid;

function issueUI(loading = false, error = false, e){
    $("#new-issue-err").hide();
    $("#new-issue-err-wrap").hide();
    $("#new-issue-loading").hide();

    if(error) {
        $("#new-issue-err").show().text(e.message);
        $("#new-issue-err-wrap").show();
    }

    if(loading) {
        $("#new-issue-loading").show();
    }
}

function issueDialog(view = "") {
    $(".issue-dialog").hide();
    $(".new-issue-err").hide();
    $(".new-issue-err-wrap").hide();
    issueUI(false, false);

    if(view === "details" || view === "new"){
        $("#"+view+"-issue-view").show();
    }

    if(view === "new"){
        $("#pagination-new-issue").addClass("active");
    } else {
        $("#pagination-new-issue").removeClass("active");
    }
}

/* Comments */
function loadComments(bugkey) {
    $("#issue-comments-loading").show();
    $("#issue-comments-empty").hide();
    $("#issue-comments").html("");

    var found = false;

    var bcRef = firebase.database().ref("/responses/"+bugkey).orderByKey().on("child_added", (s) => {
        found = true;
        $("#issue-comments-loading").hide();
        $("#issue-comments-empty").hide();
        $("#issue-comments").append("<div id=\"issue-comment-"+s.key+"\"><div class=\"issue issue-white\"><p>"+s.child("text").val()+"</p></div><div class=\"issue issue-lwhite\"><p><i class=\"material-icons left accent-text-light\">comment</i> By <b>"+s.child("display").val()+"</b> at <b>"+moment(s.child("time").val()).fromNow()+"</b></p></div></div><br />");

    });
    setTimeout(() => {
        if(!found){
            $("#issue-comments-loading").hide();
            $("#issue-comments-empty").show();
        }
    }, 15000);

    $("#issue-comments-new-btn").attr("onclick", "newComment('"+bugkey+"')");
}

function newComment(bugkey) {
    var text = $("#issue-comments-new-field").val();
    $("#issue-comments-new-err-wrap").hide();

    // validate if empty
    if(typeof text === "undefined" || text === ""){
        $("#issue-comments-new-err-wrap").show();
        $("#issue-comments-new-err").text("You cannot submit an empty comment");
        return;
    }

    var comment = {
        text,
        "uid": firebase.auth().currentUser.uid,
        "display": firebase.auth().currentUser.displayName,
        "time": firebase.database.ServerValue.TIMESTAMP
    };

    
    var key = firebase.database().ref().child("responses/"+bugkey).push().key;

    firebase.database().ref("responses/" + bugkey + "/" + key).set(comment).then(() => {
        Materialize.toast("Comment submitted successfully", 2000);
        $("#issue-comments-new-field").val("");
        Materialize.updateTextFields();
    }, (e) => {
        $("#issue-comments-new-err-wrap").show();
        $("#issue-comments-new-err").text("Failed to submit comment &mdash; "+e.message);
    });
}

/* Issues */

function openIssue(element){
    issueDialog("details");

    var id = $(element).attr("id");
    if(typeof id === "undefined"){
        return;
    } else {
        id = id.replace("issue-", "");
    }

    // validate ID is a string and clean it
    if(typeof id === "string"){
        issueid = id;
    } else {
        return;
    }

    if(typeof issues[issueid] === "undefined"){
        // return if issue does not exist
        issueDialog();
        return;
    }

    $("#issue-title").text(issues[issueid]["title"]);
    $("#issue-state").text(states[issues[issueid].state]);
    $("#issue-author").text(issues[issueid].display);
    $("#issue-time").text(moment(issues[issueid].time).fromNow());
    $("#issue-description").text(issues[issueid].text);

    $("#issue-project").text(projects[issues[issueid].project].name);
    $("#issue-pro-status").text(states[issues[issueid].state]);
    $("#issue-pro-platform").text(projects[issues[issueid].project].platform);
    $("#issue-pro-severity").text(severity[issues[issueid].severity]);

    loadComments(issueid);
}

function newIssue(){
    var user = firebase.auth().currentUser;
    issueDialog("new");
    issueUI(false, false);

    var iseverity = $("input:radio[name='new-issue-severity']:checked").val();
    var project = $("input:radio[name='new-issue-project']:checked").val();
    var title = $("#new-issue-title").val();
    var desc = $("#new-issue-desc").val();

    if(user) {
        // submit issue

        if(typeof iseverity === "undefined" || typeof project === "undefined"){
            issueUI(false, true, {"message": "Please select the affected project and issue severity."});
        } else if(title === "" || desc === ""){
            issueUI(false, true, {"message": "Please specify the title and description of your issue."});
        } else {
            var issue = {
                "severity": iseverity,
                project,
                title,
                "text": desc,
                "uid": firebase.auth().currentUser.uid,
                "display": firebase.auth().currentUser.displayName,
                "difficulty": 1,
                "state": 1,
                "time": firebase.database.ServerValue.TIMESTAMP
            };

            var key = firebase.database().ref().child("bugs").push().key;

            firebase.database().ref("bugs/" + key).set(issue).then(() => {
                issueDialog("details");
                $("#issue-title").text(issue.title);
                $("#issue-state").text(states[1]);
                $("#issue-author").text(issue.display);
                $("#issue-time").text(moment(issue.time).fromNow());
                $("#issue-description").text(issue.text);

                $("#issue-project").text(projects[issue.project].name);
                $("#issue-pro-status").text(states[1]);
                $("#issue-pro-platform").text(projects[issue.project].platform);
                $("#issue-pro-severity").text(severity[issue.severity]);

                // clear
                $("#new-issue-title").val("");
                $("#new-issue-desc").val("");
                $("input:radio[name='new-issue-project']").prop("checked", false);
                $("input:radio[name='new-issue-severity']").prop("checked", false);
                Materialize.updateTextFields();

                loadComments(key);
            }, (e) => {
                issueUI(false, true, e);
            });

        }
    } else {
        userDialog("login");
        Materialize.toast("You must be logged in to submit an issue.", 5000);
        issueUI(false, true, {"message": "You must be logged in to submit an issue."});
    }
}

$(document).ready(() => {
    issueDialog();
    pagination("");
});