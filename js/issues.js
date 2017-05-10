function openIssue(id){
    $("#issueview").show();
    $("#issue-title").text(issues[id].title);
    $("#issue-state").text(states[issues[id].state]);
    $("#issue-author").text(issues[id].display);
    $("#issue-time").text(issues[id].time);
    $("#issue-description").text(issues[id].text);

    $("#issue-project").text(projects[issues[id].project].name);
    $("#issue-pro-status").text(states[issues[id].state]);
    $("#issue-pro-platform").text(projects[issues[id].project].platform);
}
