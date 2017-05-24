/*global firebase:true projects:true states:true severity:true issues:true userDialog Materialize pagination moment:true */
/*eslint no-undef: "error"*/
// The improved page and issue handler

var bugsRef = firebase.database().ref("/bugs/");
var issues = {};
var issuekeys = [];
var page = 1;
var keyi = 0;

// load 20 issues
function showIssues(page, isloading = false) {
    var ct = issuekeys.length;
    var end = ct - (page*20);

    // page limit check
    if(page > Math.ceil(ct/20, 1) || page <= 0) {
        return false;
    }

    if(isloading){
        $(".issues-length").text("Showing "+(page*20)+" issues but still loading");
    } else {
        $(".issues-length").text("Showing "+((page*20)-20)+"-"+(page*20)+" of "+(ct-1)+" total");
    }
        

    var i = ct;
    if(page > 1){
        i = i - ((page-1)*20);
    }
    var p = 0;

    $("#pagination-pg").html("<a>"+page+"</a>");
    $("#pagination-pg-t").html("<a>"+page+"</a>");

    $(".issues-array").html("");
    while(p < 20 && i > 0) {
        var key = issuekeys[i-1];
        var data = issues[key];

        $(".issues-array").append("<div id=\"issue-"+key+"\" onclick='openIssue(this)' class=\"issue\"><p class=\"i-header\">"+data["title"]+"</p><p class=\"i-desc truncate\">"+data["text"]+"</p><div class=\"row\"><div class=\"col s12 m6 l6\"><p class=\"i-icon\"><i class=\"material-icons left accent-text\">announcement</i> "+states[data["state"]]+"</p><p class=\"i-icon\"><i class=\"material-icons left accent-text\">content_paste</i> "+projects[data["project"]].name+"</p></div><div class=\"col s12 m6 l6\"><p class=\"i-icon truncate\"><i class=\"material-icons left accent-text\">account_box</i> "+data["display"]+"</p><p class=\"i-icon\"><i class=\"material-icons left accent-text\">history</i> "+moment(data["time"]).fromNow()+"</p></div></div></div>");
        i--;
        p++;
    }

    return true;
}

// Load all issues at launch
function prefetchIssues(){
    $("#issues-v2-loading").show();
    $("#issues-v2-loading > center > p").text("Loading issues...");
    bugsRef.orderByKey().on("child_added", (s) => {

        $("#issues-v2-loading > center > p").text("Loaded "+keyi+" issues...");

        if(keyi === 20){
            $("#issues-v2-loading").hide();
            $("#issues-v2-loading > center > p").hide(); 
            showIssues(1, true);
        }    

        issues[s.key] = s.val();
        issuekeys[keyi] = s.key;
        keyi++;
    });
}

// work with UI
function pagination(pos = "") {
    if(pos === ""){
        showIssues(1);
    } else if(pos === "-"){
        if(showIssues(page-1)) {
            page--;
        }
    } else {
        if(showIssues(page+1)){
            page++;
        }
    }
}

$(document).ready(() => {
    prefetchIssues();
});