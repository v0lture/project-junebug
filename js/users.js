/*global firebase:true projects:true states:true severity:true issues:true userDialog Materialize pagination moment:true */
/*eslint no-undef: "error"*/

function userFromUID(uid, issueid = 0) {
    firebase.database().ref("/users/"+uid+"/").once("value").then((snapshot) => {
        
        // no issueid
        if(issueid !== 0) {
            issues[issueid].display = snapshot.child("display").val();
            $("#issue-display-"+issueid).text(snapshot.child("display").val());
        }
    });
}