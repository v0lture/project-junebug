function openIssue(id){
    issueDialog("details");

    $("#issue-title").text(issues[id].title);
    $("#issue-state").text(states[issues[id].state]);
    $("#issue-author").text(issues[id].display);
    $("#issue-time").text(moment(issues[id].time).fromNow());
    $("#issue-description").text(issues[id].text);

    $("#issue-project").text(projects[issues[id].project].name);
    $("#issue-pro-status").text(states[issues[id].state]);
    $("#issue-pro-platform").text(projects[issues[id].project].platform);
    $("#issue-pro-severity").text(severity[issues[id].severity]);
}

function newIssue(){
    var user = firebase.auth().currentUser;
    issueDialog('new');
    issueUI();

    var severity = $("input:radio[name='new-issue-severity']:checked").val();
    var project = $("input:radio[name='new-issue-project']:checked").val();
    var title = $("#new-issue-title").val();
    var desc = $("#new-issue-desc").val();

    if(user) {
        // submit issue

        if(severity === undefined || project === undefined){
            issueUI(false, true, {"message": "Please select the affected project and issue severity."});
        } else if(title === "" || desc === ""){
            issueUI(false, true, {"message": "Please specify the title and description of your issue."});
        } else {
            var issue = {
                "severity": severity,
                "project": project,
                "title": title,
                "text": desc,
                "uid": firebase.auth().currentUser.uid,
                "display": firebase.auth().currentUser.displayName,
                "difficulty": 1,
                "state": 1,
                "time": firebase.database.ServerValue.TIMESTAMP
            };

            console.log(issue);

            
            var key = firebase.database().ref().child('bugs').push().key;

            firebase.database().ref('bugs/' + key).set(issue).then(() => {
                openIssue(key);
            }, (e) => {
                issueUI(false, true, e);
            });

        }
    } else {
        userDialog('login');
        Materialize.toast('You must be logged in to submit an issue.', 5000);
        issueUI(false, true, {"message": "You must be logged in to submit an issue."});
    }
}

function issueDialog(view = "") {
    $(".issue-dialog").hide();
    $(".new-issue-err").hide();
    $(".new-issue-err-wrap").hide();

    if(view === "details" || view === "new"){
        $("#"+view+"-issue-view").show();
    }
}

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

$(document).ready(() => {
    issueDialog();
})