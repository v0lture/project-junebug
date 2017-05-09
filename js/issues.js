function openIssue(id){
    $("#issue-title").text(issues[id].title);
    $("#issue-state").text(states[issues[id].state]);
    $("#issue-author").text(issues[id].display);
    $("#issue-time").text(issues[id].time);
    $("#issue-description").text(issues[id].text);
}
